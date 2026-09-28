import { Router } from 'express';
import { PoolConnection, RowDataPacket } from 'mysql2/promise';
import { randomUUID } from 'crypto';
import { EnvironmentalCategory, MozambiqueProvince, Occurrence, OccurrenceStatus, SeverityLevel } from '../../src/types';
import { getDatabase } from '../db';
import { AuthenticatedRequest, requireFirebaseUser } from '../firebaseAuth';

const router = Router();

const categories: EnvironmentalCategory[] = [
  'Desmatamento',
  'Queimadas Descontroladas',
  'Poluição Hídrica',
  'Erosão Costeira/Pluvial',
  'Resíduos Sólidos Urbanos',
  'Destruição de Mangais',
  'Caça Furtiva & Biodiversidade',
  'Mineração Ilegal'
];
const severities: SeverityLevel[] = ['Baixo', 'Médio', 'Alto', 'Crítico'];
const statuses: OccurrenceStatus[] = ['Recebido', 'Em Validação', 'Validado', 'Em Intervenção', 'Resolvido'];
const provinces: MozambiqueProvince[] = [
  'Cabo Delgado', 'Niassa', 'Nampula', 'Zambézia', 'Tete', 'Manica', 'Sofala',
  'Inhambane', 'Gaza', 'Maputo Província', 'Maputo Cidade'
];

interface OccurrenceRow extends RowDataPacket {
  id: string;
  protocol: string;
  title: string;
  category: EnvironmentalCategory;
  severity: SeverityLevel;
  province: MozambiqueProvince;
  district: string;
  location_details: string;
  latitude: number;
  longitude: number;
  is_anonymous: number;
  occurred_at: string | Date;
  status: OccurrenceStatus;
  description: string;
  image_url: string | null;
  validation_score: number;
  assigned_team: string | null;
  action_summary: string | null;
}

const toOccurrence = (row: OccurrenceRow): Occurrence => ({
  id: row.id,
  protocol: row.protocol,
  title: row.title,
  category: row.category,
  severity: row.severity,
  province: row.province,
  district: row.district,
  locationDetails: row.location_details,
  coordinates: { lat: Number(row.latitude), lng: Number(row.longitude) },
  reportedBy: row.is_anonymous ? 'Anónimo' : 'Utilizador autenticado',
  isAnonymous: Boolean(row.is_anonymous),
  timestamp: row.occurred_at instanceof Date
    ? row.occurred_at.toISOString()
    : new Date(`${row.occurred_at.replace(' ', 'T')}Z`).toISOString(),
  status: row.status,
  description: row.description,
  imageUrl: row.image_url || undefined,
  validationScore: Number(row.validation_score),
  assignedTeam: row.assigned_team || undefined,
  actionSummary: row.action_summary || undefined
});

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

router.get('/', requireFirebaseUser, async (request, response) => {
  try {
    const page = Math.max(1, Number(request.query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(request.query.pageSize) || 25));
    const conditions: string[] = [];
    const values: Array<string | number> = [];

    const authUser = (request as AuthenticatedRequest).authenticatedUser;
    if (authUser?.role === 'cidadao') {
      conditions.push('(verification_status = \'verified\' OR reporter_user_id = ?)');
      values.push(authUser.id);
    }

    if (typeof request.query.province === 'string' && provinces.includes(request.query.province as MozambiqueProvince)) {
      conditions.push('province = ?');
      values.push(request.query.province);
    }
    if (typeof request.query.status === 'string' && statuses.includes(request.query.status as OccurrenceStatus)) {
      conditions.push('status = ?');
      values.push(request.query.status);
    }
    if (typeof request.query.category === 'string' && categories.includes(request.query.category as EnvironmentalCategory)) {
      conditions.push('category = ?');
      values.push(request.query.category);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const database = getDatabase();
    const [rows] = await database.execute<OccurrenceRow[]>(
      `SELECT id, protocol, title, category, severity, province, district,
              location_details, latitude, longitude, is_anonymous, occurred_at,
              status, description, image_url, validation_score, assigned_team, action_summary
       FROM occurrences ${where}
       ORDER BY occurred_at DESC
       LIMIT ? OFFSET ?`,
      [...values, pageSize, (page - 1) * pageSize]
    );
    const [[countRow]] = await database.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS total FROM occurrences ${where}`,
      values
    );

    return response.json({
      data: rows.map(toOccurrence),
      pagination: { page, pageSize, total: Number(countRow.total) }
    });
  } catch (error) {
    console.error('Falha ao listar ocorrências:', error);
    return response.status(503).json({ error: 'Não foi possível consultar as ocorrências.' });
  }
});

router.post('/', requireFirebaseUser, async (request, response) => {
  const body = request.body;
  if (!isRecord(body)) return response.status(400).json({ error: 'Pedido inválido.' });

  const { title, category, severity, province, district, locationDetails, coordinates, description, isAnonymous, imageUrl } = body;
  if (typeof title !== 'string' || title.trim().length < 5 || title.length > 180) {
    return response.status(400).json({ error: 'O título deve conter entre 5 e 180 caracteres.' });
  }
  if (typeof description !== 'string' || description.trim().length < 10 || description.length > 5000) {
    return response.status(400).json({ error: 'A descrição deve conter entre 10 e 5.000 caracteres.' });
  }
  if (!categories.includes(category) || !severities.includes(severity) || !provinces.includes(province)) {
    return response.status(400).json({ error: 'Categoria, gravidade ou província inválida.' });
  }
  if (typeof district !== 'string' || !district.trim() || district.length > 100 ||
      typeof locationDetails !== 'string' || locationDetails.length > 500) {
    return response.status(400).json({ error: 'Localização inválida.' });
  }
  const latitude = Number(coordinates?.lat);
  const longitude = Number(coordinates?.lng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return response.status(400).json({ error: 'Coordenadas inválidas.' });
  }
  if (typeof isAnonymous !== 'boolean' || (imageUrl !== undefined && (typeof imageUrl !== 'string' || imageUrl.length > 1000))) {
    return response.status(400).json({ error: 'Metadados da ocorrência inválidos.' });
  }
  if (imageUrl) {
    return response.status(501).json({ error: 'O armazenamento seguro de fotografias ainda não está disponível. Remova a foto para registar a ocorrência.' });
  }

  const authUser = (request as AuthenticatedRequest).authenticatedUser;
  if (!authUser) return response.status(401).json({ error: 'Autenticação necessária.' });

  const id = randomUUID();
  const protocol = `ECO-${new Date().getUTCFullYear()}-${id.slice(0, 8).toUpperCase()}`;
  const now = new Date();
  let connection: PoolConnection | null = null;
  try {
    const database = getDatabase();
    connection = await database.getConnection();
    await connection.beginTransaction();
    const [sourceRows] = await connection.execute<RowDataPacket[]>(
      `SELECT id FROM data_sources WHERE name = ? AND source_type = 'COMMUNITY' LIMIT 1`,
      ['ECO-MZ 360 - submissão comunitária']
    );
    if (!sourceRows[0]) throw new Error('Community data source missing; apply database migrations.');

    await connection.execute(
      `INSERT INTO occurrences
        (id, protocol, title, category, severity, province, district, location_details,
         latitude, longitude, reporter_user_id, is_anonymous, occurred_at, status,
         description, image_url, data_source_id, verification_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Recebido', ?, ?, ?, 'unverified')`,
      [id, protocol, title.trim(), category, severity, province, district.trim(), locationDetails.trim(),
        latitude, longitude, authUser.id, isAnonymous, now, description.trim(), null, sourceRows[0].id]
    );
    await connection.execute(
      `INSERT INTO occurrence_status_history (occurrence_id, old_status, new_status, changed_by, reason)
       VALUES (?, NULL, 'Recebido', ?, 'Ocorrência submetida')`,
      [id, authUser.id]
    );
    await connection.execute(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, after_json)
       VALUES (?, 'CREATE', 'occurrence', ?, JSON_OBJECT('protocol', ?, 'status', 'Recebido'))`,
      [authUser.id, id, protocol]
    );
    await connection.commit();

    const occurrence: Occurrence = {
      id, protocol, title: title.trim(), category, severity, province, district: district.trim(),
      locationDetails: locationDetails.trim(), coordinates: { lat: latitude, lng: longitude },
      reportedBy: isAnonymous ? 'Anónimo' : 'Utilizador autenticado', isAnonymous,
      timestamp: now.toISOString(), status: 'Recebido', description: description.trim(),
      imageUrl: imageUrl || undefined, validationScore: 0
    };
    return response.status(201).json({ data: occurrence, provenance: 'COMMUNITY_UNVERIFIED' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Falha ao criar ocorrência:', error);
    return response.status(503).json({ error: 'Não foi possível registar a ocorrência.' });
  } finally {
    connection?.release();
  }
});

router.patch('/:id/status', requireFirebaseUser, async (request, response) => {
  const authUser = (request as AuthenticatedRequest).authenticatedUser;
  if (!authUser) return response.status(401).json({ error: 'Autenticação necessária.' });
  if (!['admin', 'gestor', 'tecnico'].includes(authUser.role)) {
    return response.status(403).json({ error: 'O seu perfil não pode alterar o estado de ocorrências.' });
  }

  const id = request.params.id;
  const { status, reason } = request.body || {};
  if (!statuses.includes(status) || (reason !== undefined && (typeof reason !== 'string' || reason.length > 1000))) {
    return response.status(400).json({ error: 'Estado ou justificação inválidos.' });
  }

  let connection: PoolConnection | null = null;
  try {
    const database = getDatabase();
    connection = await database.getConnection();
    await connection.beginTransaction();
    const [rows] = await connection.execute<OccurrenceRow[]>(
      'SELECT * FROM occurrences WHERE id = ? FOR UPDATE', [id]
    );
    const current = rows[0];
    if (!current) {
      await connection.rollback();
      return response.status(404).json({ error: 'Ocorrência não encontrada.' });
    }

    await connection.execute('UPDATE occurrences SET status = ? WHERE id = ?', [status, id]);
    await connection.execute(
      `INSERT INTO occurrence_status_history (occurrence_id, old_status, new_status, changed_by, reason)
       VALUES (?, ?, ?, ?, ?)`,
      [id, current.status, status, authUser.id, reason || null]
    );
    await connection.execute(
      `INSERT INTO audit_logs (actor_user_id, action, entity_type, entity_id, before_json, after_json)
       VALUES (?, 'UPDATE_STATUS', 'occurrence', ?, JSON_OBJECT('status', ?), JSON_OBJECT('status', ?))`,
      [authUser.id, id, current.status, status]
    );
    await connection.commit();
    return response.json({ data: { id, status } });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Falha ao atualizar ocorrência:', error);
    return response.status(503).json({ error: 'Não foi possível atualizar a ocorrência.' });
  } finally {
    connection?.release();
  }
});

export default router;