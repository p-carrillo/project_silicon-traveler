import mariadb, { type PoolConnection } from 'mariadb';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const dbHost = requireEnv('DB_HOST');
const dbPort = parseInt(requireEnv('DB_PORT'), 10);
const dbUser = requireEnv('DB_USER');
const dbPassword = requireEnv('DB_PASSWORD');
const dbName = requireEnv('DB_NAME');

export const pool = mariadb.createPool({
  host: dbHost,
  port: dbPort,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  connectionLimit: parseInt(process.env.DB_POOL_SIZE || '10', 10),
  idleTimeout: 30000,
  acquireTimeout: 30000,
  timezone: 'Z', // UTC
});

export type QueryExecutor = Pick<PoolConnection, 'query'>;

export async function runInTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await work(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function healthCheck(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

export async function closePool(): Promise<void> {
  await pool.end();
}
