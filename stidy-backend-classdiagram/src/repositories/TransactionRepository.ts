import { Db, pool, queryAll, queryOne } from '../config/db';
import { Transaction } from '../domain/entities';

export class TransactionRepository {
  create(d: { orderId: string; userId: string; planId: string; amount: number; currency: string; expiresAt: Date }, db: Db = pool) {
    return queryOne(db, Transaction,
      `insert into transactions (order_id, user_id, plan_id, amount, currency, expires_at)
       values ($1,$2,$3,$4,$5,$6) returning *`,
      [d.orderId, d.userId, d.planId, d.amount, d.currency, d.expiresAt]) as Promise<Transaction>;
  }
  findByIdForUser(id: string, userId: string, db: Db = pool) {
    return queryOne(db, Transaction, 'select * from transactions where id = $1 and user_id = $2', [id, userId]);
  }
  /** forUpdate=true mengunci baris agar notifikasi paralel diproses berurutan. */
  findByOrderId(orderId: string, forUpdate = false, db: Db = pool) {
    return queryOne(db, Transaction,
      `select * from transactions where order_id = $1 ${forUpdate ? 'for update' : ''}`, [orderId]);
  }
  listByUser(userId: string, db: Db = pool) {
    return queryAll(db, Transaction, 'select * from transactions where user_id = $1 order by created_at desc', [userId]);
  }
  save(t: Transaction, db: Db = pool) {
    return queryOne(db, Transaction,
      `update transactions set status=$2, payment_method=$3, gateway_transaction_id=$4,
         payment_url=$5, paid_at=$6 where id=$1 returning *`,
      [t.id, t.status, t.paymentMethod, t.gatewayTransactionId, t.paymentUrl, t.paidAt]) as Promise<Transaction>;
  }
}
