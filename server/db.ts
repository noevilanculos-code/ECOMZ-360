import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export const getDatabase = (): Pool => {
  if (pool) return pool;

  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  if (!database || !user) {
    throw new Error('MySQL is not configured. Set DB_NAME and DB_USER.');
  }

  pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    database,
    user,
    password: process.env.DB_PASS || '',
    charset: 'utf8mb4',
    timezone: 'Z',
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_SIZE || 10),
    queueLimit: 0,
    decimalNumbers: true
  });

  return pool;
};

export const closeDatabase = async (): Promise<void> => {
  if (!pool) return;
  await pool.end();
  pool = null;
};