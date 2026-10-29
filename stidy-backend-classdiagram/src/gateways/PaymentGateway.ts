import { SubscriptionPlan, Transaction, User } from '../domain/entities';
import { TransactionStatus } from '../domain/enums';

export interface ChargeResult { paymentUrl: string; gatewayTransactionId: string | null }

export interface NormalizedNotification {
  eventId: string;              // dipakai sebagai payment_notifications.gateway_event_id
  orderId: string;
  status: TransactionStatus;
  grossAmount: number;
  paymentMethod: string | null;
  gatewayTransactionId: string | null;
}

export interface PaymentGateway {
  createCharge(trx: Transaction, user: User, plan: SubscriptionPlan): Promise<ChargeResult>;
  /** Verifikasi signature lalu normalisasi payload. Melempar 401 jika signature salah. */
  parseNotification(raw: Record<string, any>): NormalizedNotification;
}
