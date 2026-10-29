import { Db, pool, queryOne } from '../config/db';
import { Subscription } from '../domain/entities';

export class SubscriptionRepository {
  /** transaction_id unik: notifikasi duplikat tidak menambah periode dua kali. */
  create(d: { userId: string; planId: string; transactionId: string; startAt: Date; endAt: Date }, db: Db = pool) {
    return queryOne(db, Subscription,
      `insert into subscriptions (user_id, plan_id, transaction_id, start_at, end_at)
       values ($1,$2,$3,$4,$5) on conflict (transaction_id) do nothing returning *`,
      [d.userId, d.planId, d.transactionId, d.startAt, d.endAt]);
  }
  findCurrent(userId: string, db: Db = pool) {
    return queryOne(db, Subscription,
      `select * from subscriptions where user_id=$1 and status='active' and end_at > now()
       order by end_at desc limit 1`, [userId]);
  }
  async latestActiveEnd(userId: string, db: Db = pool): Promise<Date | null> {
    const r = await db.query(
      `select max(end_at) as e from subscriptions where user_id=$1 and status='active' and end_at > now()`, [userId]);
    return r.rows[0].e ?? null;
  }
  async isPremium(userId: string, db: Db = pool): Promise<boolean> {
    return (await db.query('select is_premium($1) as p', [userId])).rows[0].p;
  }
  async expireOverdue(db: Db = pool): Promise<number> {
    const r = await db.query(`update subscriptions set status='expired' where status='active' and end_at <= now()`);
    return r.rowCount ?? 0;
  }
}
