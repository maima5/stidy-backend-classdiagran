import { Db, pool } from '../config/db';
import { Subscription, SubscriptionPlan, Transaction } from '../domain/entities';
import { SubscriptionPlanRepository } from '../repositories/SubscriptionPlanRepository';
import { SubscriptionRepository } from '../repositories/SubscriptionRepository';

export class SubscriptionService {
  constructor(private subs: SubscriptionRepository, private plans: SubscriptionPlanRepository) {}

  listPlans() { return this.plans.listActive(); }
  isPremium(userId: string) { return this.subs.isPremium(userId); }
  getCurrent(userId: string) { return this.subs.findCurrent(userId); }
  expireOverdue() { return this.subs.expireOverdue(); }

  /**
   * Mengaktifkan premium dari transaksi lunas. Jika user masih punya langganan aktif,
   * periode baru disambung setelah periode lama berakhir (tidak menimpa).
   */
  async activateFromTransaction(trx: Transaction, plan: SubscriptionPlan, db: Db = pool): Promise<Subscription | null> {
    const paidAt = trx.paidAt ?? new Date();
    const currentEnd = await this.subs.latestActiveEnd(trx.userId, db);
    const startAt = currentEnd && currentEnd > paidAt ? currentEnd : paidAt;
    return this.subs.create({
      userId: trx.userId, planId: plan.id, transactionId: trx.id,
      startAt, endAt: plan.endDateFrom(startAt),
    }, db);
  }
}
