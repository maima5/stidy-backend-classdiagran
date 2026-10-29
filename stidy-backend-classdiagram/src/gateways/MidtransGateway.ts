import { createHash, timingSafeEqual } from 'crypto';
import { env } from '../config/env';
import { AppError, badRequest, unauthorized } from '../config/errors';
import { SubscriptionPlan, Transaction, User } from '../domain/entities';
import { TransactionStatus } from '../domain/enums';
import { ChargeResult, NormalizedNotification, PaymentGateway } from './PaymentGateway';

export class MidtransGateway implements PaymentGateway {
  async createCharge(trx: Transaction, user: User, plan: SubscriptionPlan): Promise<ChargeResult> {
    const res = await fetch(`${env.midtransBaseUrl}/snap/v1/transactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + Buffer.from(env.midtransServerKey + ':').toString('base64'),
      },
      body: JSON.stringify({
        transaction_details: { order_id: trx.orderId, gross_amount: Math.round(trx.amount) },
        customer_details: { first_name: user.name, email: user.email },
        item_details: [{ id: plan.code, name: plan.name, price: Math.round(trx.amount), quantity: 1 }],
      }),
    });
    if (!res.ok) throw new AppError(502, 'Gagal membuat pembayaran di gateway', 'GATEWAY_ERROR');
    const data = (await res.json()) as { redirect_url: string };
    return { paymentUrl: data.redirect_url, gatewayTransactionId: null };
  }

  parseNotification(raw: Record<string, any>): NormalizedNotification {
    const { order_id, status_code, gross_amount, signature_key, transaction_status, transaction_id } = raw;
    if (!order_id || !status_code || !gross_amount || !signature_key || !transaction_status) {
      throw badRequest('Payload notifikasi tidak lengkap');
    }
    const expected = createHash('sha512')
      .update(`${order_id}${status_code}${gross_amount}${env.midtransServerKey}`).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(String(signature_key));
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw unauthorized('Signature tidak valid');

    return {
      eventId: `${transaction_id ?? order_id}:${transaction_status}`,
      orderId: String(order_id),
      status: this.mapStatus(String(transaction_status), raw.fraud_status),
      grossAmount: Number(gross_amount),
      paymentMethod: raw.payment_type ?? null,
      gatewayTransactionId: transaction_id ?? null,
    };
  }

  private mapStatus(s: string, fraud?: string): TransactionStatus {
    if (s === 'settlement' || (s === 'capture' && fraud !== 'challenge')) return TransactionStatus.Paid;
    if (s === 'expire') return TransactionStatus.Expired;
    if (['deny', 'cancel', 'failure'].includes(s)) return TransactionStatus.Failed;
    return TransactionStatus.Pending;
  }
}
