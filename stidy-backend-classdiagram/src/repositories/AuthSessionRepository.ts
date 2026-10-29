import { Db, pool, queryOne } from '../config/db';
import { AuthSession } from '../domain/entities';

export class AuthSessionRepository {
  create(d: { userId: string; tokenHash: string; userAgent?: string; ipAddress?: string; expiresAt: Date }, db: Db = pool) {
    return queryOne(db, AuthSession,
      `insert into auth_sessions (user_id, token_hash, user_agent, ip_address, expires_at)
       values ($1,$2,$3,$4,$5) returning *`,
      [d.userId, d.tokenHash, d.userAgent ?? null, d.ipAddress ?? null, d.expiresAt]) as Promise<AuthSession>;
  }
  findByTokenHash(hash: string, db: Db = pool) {
    return queryOne(db, AuthSession, 'select * from auth_sessions where token_hash = $1', [hash]);
  }
  revoke(id: string, db: Db = pool) {
    return db.query('update auth_sessions set revoked_at = now() where id = $1 and revoked_at is null', [id]);
  }
  revokeAllForUser(userId: string, db: Db = pool) {
    return db.query('update auth_sessions set revoked_at = now() where user_id = $1 and revoked_at is null', [userId]);
  }
}
