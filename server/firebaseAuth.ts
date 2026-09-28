import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Auth, DecodedIdToken, getAuth } from 'firebase-admin/auth';
import { NextFunction, Request, Response } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { getDatabase } from './db';

export interface AuthenticatedRequest extends Request {
  authenticatedUser?: {
    id: number;
    firebaseUid: string;
    role: string;
    email?: string;
  };
}

const getFirebaseAdminAuth = () => {
  if (getApps().length === 0) {
    const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (rawServiceAccount) {
      initializeApp({ credential: cert(JSON.parse(rawServiceAccount)) });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }
  return getAuth();
};

interface AppUserRow extends RowDataPacket {
  id: number;
  active: number;
  role_code: string | null;
}

const getOrCreateUser = async (token: DecodedIdToken) => {
  const database = getDatabase();
  const connection = await database.getConnection();
  try {
    await connection.beginTransaction();
    await connection.execute<ResultSetHeader>(
      `INSERT INTO users (firebase_uid, email, display_name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE email = VALUES(email), display_name = VALUES(display_name)`,
      [token.uid, token.email || null, token.name || token.email?.split('@')[0] || 'Utilizador']
    );
    const [userRows] = await connection.execute<AppUserRow[]>(
      `SELECT u.id, u.active, ur.role_code
       FROM users u
       LEFT JOIN user_roles ur ON ur.user_id = u.id
       WHERE u.firebase_uid = ?
       ORDER BY FIELD(ur.role_code, 'admin', 'gestor', 'tecnico', 'instituicao', 'cidadao')
       LIMIT 1 FOR UPDATE`,
      [token.uid]
    );
    const user = userRows[0];
    if (!user || !user.active) {
      await connection.rollback();
      return null;
    }

    if (!user.role_code) {
      await connection.execute(
        `INSERT IGNORE INTO user_roles (user_id, role_code)
         VALUES (?, 'cidadao')`,
        [user.id]
      );
    }

    await connection.commit();
    return {
      id: user.id,
      firebaseUid: token.uid,
      role: user.role_code || 'cidadao',
      email: token.email
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const requireFirebaseUser = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const authRequest = request as AuthenticatedRequest;
  const authorization = request.header('authorization') || '';
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return response.status(401).json({ error: 'Autenticação necessária.' });
  }

  let firebaseAuth: Auth;
  try {
    firebaseAuth = getFirebaseAdminAuth();
  } catch (error) {
    console.error('Firebase Admin não está configurado:', error);
    return response.status(503).json({ error: 'Serviço de autenticação temporariamente indisponível.' });
  }

  let token: DecodedIdToken;
  try {
    token = await firebaseAuth.verifyIdToken(match[1]);
  } catch (error) {
    console.warn('Token Firebase recusado:', error);
    return response.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  try {
    const user = await getOrCreateUser(token);
    if (!user) return response.status(403).json({ error: 'A conta está inativa.' });
    authRequest.authenticatedUser = user;
    next();
  } catch (error) {
    console.error('Falha ao carregar utilizador da API:', error);
    return response.status(503).json({ error: 'Serviço de utilizadores temporariamente indisponível.' });
  }
};

export const requireRoles = (...roles: string[]) => (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const user = (request as AuthenticatedRequest).authenticatedUser;
  if (!user || !roles.includes(user.role)) {
    return response.status(403).json({ error: 'Não tem permissão para esta operação.' });
  }
  next();
};