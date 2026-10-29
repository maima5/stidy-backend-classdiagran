import { Pool, PoolClient } from 'pg';
import { env } from './env';

export const pool = new Pool({ connectionString: env.databaseUrl });
export type Db = Pool | PoolClient;

export async function withTx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (e) {
    await client.query('rollback');
    throw e;
  } finally {
    client.release();
  }
}

const camel = (s: string) => s.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());

function camelize(row: Record<string, unknown>): any {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(row)) out[camel(k)] = v;
  return out;
}

type Ctor<T> = new (props: any) => T;

export async function queryAll<T>(db: Db, ctor: Ctor<T>, sql: string, params: unknown[] = []): Promise<T[]> {
  const res = await db.query(sql, params);
  return res.rows.map((r) => new ctor(camelize(r)));
}

export async function queryOne<T>(db: Db, ctor: Ctor<T>, sql: string, params: unknown[] = []): Promise<T | null> {
  const rows = await queryAll(db, ctor, sql, params);
  return rows[0] ?? null;
}
