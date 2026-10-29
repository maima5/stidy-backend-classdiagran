import { Db, pool, queryAll, queryOne } from '../config/db';
import { SubscriptionPlan } from '../domain/entities';

export class SubscriptionPlanRepository {
  listActive(db: Db = pool) {
    return queryAll(db, SubscriptionPlan, 'select * from subscription_plans where is_active order by duration_days');
  }
  findById(id: string, db: Db = pool) {
    return queryOne(db, SubscriptionPlan, 'select * from subscription_plans where id = $1', [id]);
  }
}
