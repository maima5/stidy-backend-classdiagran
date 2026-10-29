import { randomBytes } from 'crypto';
import { withTx } from '../config/db';
import { badRequest, notFound } from '../config/errors';
import { Transaction } from '../domain/entities';
import { TransactionStatus } from '../domain/enums';
import { PaymentGateway } from '../gateways/PaymentGateway';
import { PaymentNotificationRepository } from '../repositories/PaymentNotificationRepository';
import { SubscriptionPlanRepository } from '../repositories/SubscriptionPlanRepository';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { UserRepository } from '../repositories/UserRepository';
import { SubscriptionService } from './SubscriptionService';

const PAYMENT_WINDOW_MS = 24 * 3600 * 1000;

export class PaymentService {
  constructor(
    private trxs: TransactionRepository,
    private plans: SubscriptionPlanRepository,
    private users: UserRepository,
    private notifs: PaymentNotificationRepository,
    private subscriptions: SubscriptionService,
    private gateway: PaymentGateway,
  ) {}

  /** Satu percobaan bayar = satu transaksi. Retry setelah gagal/kedaluwarsa = transaksi baru. */
  async checkout(userId: string, planId: string): Promise<Transaction> {
    const plan = await this.plans.findById(planId);
    if (!plan || !plan.isActive) throw badRequest('Paket tidak tersedia');
    const user = (await this.users.findById(userId))!;

    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const trx = await this.trxs.create({
      orderId: `STIDY-${date}-${randomBytes(4).toString('hex').toUpperCase()}`,
      userId, planId: plan.id, amount: plan.price, currency: plan.currency,
      expiresAt: new Date(Date.now() + PAYMENT_WINDOW_MS),
    });
    const charge = await this.gateway.createCharge(trx, user, plan);
    trx.paymentUrl = charge.paymentUrl;
    trx.gatewayTransactionId = charge.gatewayTransactionId;
    return this.trxs.save(trx);
  }

  listTransactions(userId: string) { return this.trxs.listByUser(userId); }

  async getTransaction(userId: string, id: string) {
    const t = await this.trxs.findByIdForUser(id, userId);
    if (!t) throw notFound('Transaksi tidak ditemukan');
    return t;
  }

  /**
   * Webhook gateway. Idempoten (gateway_event_id unik), memvalidasi amount,
   * dan tidak pernah mengaktifkan premium dua kali (subscriptions.transaction_id unik).
   */
  async handleNotification(raw: Record<string, any>): Promise<{ result: string }> {
    const n = this.gateway.parseNotification(raw); // validasi signature

    return withTx(async (tx) => {
      const trx = await this.trxs.findByOrderId(n.orderId, true, tx);
      const log = await this.notifs.insertIfNew(n.eventId, trx?.id ?? null, raw, tx);
      if (!log) return { result: 'duplicate_ignored' };

      if (!trx) {
        await this.notifs.resolve(log.id, { processed: false, needsReview: true,
          note: 'order_id tidak ditemukan di tabel transactions, premium tidak diaktifkan' }, tx);
        return { result: 'needs_review' };
      }
      if (!trx.amountMatches(n.grossAmount)) {
        await this.notifs.resolve(log.id, { processed: false, needsReview: true,
          note: `amount tidak cocok: transaksi ${trx.amount}, gateway ${n.grossAmount}` }, tx);
        return { result: 'needs_review' };
      }

      if (!trx.isPaid()) { // transaksi yang sudah paid tidak diubah lagi
        trx.gatewayTransactionId = n.gatewayTransactionId ?? trx.gatewayTransactionId;
        if (n.status === TransactionStatus.Paid) {
          trx.markPaid(n.paymentMethod);
          await this.trxs.save(trx, tx);
          const plan = (await this.plans.findById(trx.planId, tx))!;
          await this.subscriptions.activateFromTransaction(trx, plan, tx);
        } else if (n.status !== TransactionStatus.Pending) {
          trx.status = n.status;
          await this.trxs.save(trx, tx);
        }
      }
      await this.notifs.resolve(log.id, { processed: true, needsReview: false }, tx);
      return { result: 'processed' };
    });
  }
}
