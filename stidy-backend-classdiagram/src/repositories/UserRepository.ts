import { Db, pool, queryAll, queryOne } from '../config/db';
import { User } from '../domain/entities';
import { AccountStatus } from '../domain/enums';

export class UserRepository {
  findById(id: string, db: Db = pool) {
    return queryOne(db, User, 'select * from users where id = $1', [id]);
  }
  findByEmail(email: string, db: Db = pool) {
    return queryOne(db, User, 'select * from users where lower(email) = lower($1)', [email]);
  }
  create(name: string, email: string, passwordHash: string, db: Db = pool) {
    return queryOne(db, User,
      `insert into users (name, email, password_hash) values ($1, $2, $3) returning *`,
      [name, email, passwordHash]) as Promise<User>;
  }
  touchLogin(id: string, db: Db = pool) {
    return db.query('update users set last_login_at = now() where id = $1', [id]);
  }
  updateStatus(id: string, status: AccountStatus, db: Db = pool) {
    return queryOne(db, User, 'update users set status = $2 where id = $1 returning *', [id, status]);
  }
  async list(opts: { status?: AccountStatus; search?: string; limit: number; offset: number }, db: Db = pool) {
    const where: string[] = ["role = 'user'"];
    const params: unknown[] = [];
    if (opts.status) { params.push(opts.status); where.push(`status = $${params.length}`); }
    if (opts.search) { params.push(`%${opts.search}%`); where.push(`(name ilike $${params.length} or email ilike $${params.length})`); }
    const w = where.join(' and ');
    const total = Number((await db.query(`select count(*) from users where ${w}`, params)).rows[0].count);
    params.push(opts.limit, opts.offset);
    const items = await queryAll(db, User,
      `select * from users where ${w} order by created_at desc limit $${params.length - 1} offset $${params.length}`, params);
    return { items, total };
  }
}
