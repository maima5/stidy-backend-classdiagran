import { Db, pool, queryAll, queryOne } from '../config/db';
import { PaymentNotification } from '../domain/entities';

export class PaymentNotificationRepository {
  /** Mengembalikan null jika gateway_event_id sudah pernah diterima (duplikat). */
  insertIfNew(eventId: string, transactionId: string | null, payload: unknown, db: Db = pool) {
    return queryOne(db, PaymentNotification,
      `insert into payment_notifications (gateway_event_id, transaction_id, payload)
       values ($1,$2,$3) on conflict (gateway_event_id) do nothing returning *`,
      [eventId, transactionId, JSON.stringify(payload)]);
  }
  resolve(id: string, r: { processed: boolean; needsReview: boolean; note?: string }, db: Db = pool) {
    return db.query(
      `update payment_notifications
       set processed=$2, needs_review=$3, review_note=$4, processed_at = case when $2 then now() end
       where id=$1`, [id, r.processed, r.needsReview, r.note ?? null]);
  }
  listNeedsReview(db: Db = pool) {
    return queryAll(db, PaymentNotification,
      'select * from payment_notifications where needs_review order by received_at desc');
  }
}
