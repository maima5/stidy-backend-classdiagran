import {
  AccountStatus, StudySessionStatus, SubscriptionStatus, TransactionStatus, UserRole,
} from './enums';
import { conflict } from '../config/errors';

export class User {
  id!: string; name!: string; email!: string; passwordHash!: string;
  role!: UserRole; status!: AccountStatus;
  lastLoginAt!: Date | null; createdAt!: Date; updatedAt!: Date;
  constructor(p: Partial<User>) { Object.assign(this, p); }

  isAdmin(): boolean { return this.role === UserRole.Admin; }
  isActive(): boolean { return this.status === AccountStatus.Active; }
  toPublic() {
    const { passwordHash: _omit, ...rest } = this;
    return rest;
  }
}

export class AuthSession {
  id!: string; userId!: string; tokenHash!: string;
  userAgent!: string | null; ipAddress!: string | null;
  expiresAt!: Date; revokedAt!: Date | null; createdAt!: Date;
  constructor(p: Partial<AuthSession>) { Object.assign(this, p); }

  isValid(now = new Date()): boolean { return !this.revokedAt && this.expiresAt > now; }
}

export class StudySchedule {
  id!: string; userId!: string; title!: string; description!: string | null;
  startTime!: Date; endTime!: Date; createdAt!: Date; updatedAt!: Date;
  constructor(p: Partial<StudySchedule>) { Object.assign(this, p); }

  durationMinutes(): number {
    return Math.round((this.endTime.getTime() - this.startTime.getTime()) / 60000);
  }
}

export class StudySession {
  id!: string; scheduleId!: string; userId!: string; status!: StudySessionStatus;
  startedAt!: Date | null; completedAt!: Date | null; createdAt!: Date; updatedAt!: Date;
  constructor(p: Partial<StudySession>) { Object.assign(this, p); }

  start(now = new Date()): void {
    if (this.status !== StudySessionStatus.Planned) throw conflict('Sesi hanya bisa dimulai dari status planned');
    this.status = StudySessionStatus.InProgress;
    this.startedAt = now;
  }
  complete(now = new Date()): void {
    if (this.status !== StudySessionStatus.InProgress) throw conflict('Sesi harus berstatus in_progress untuk diselesaikan');
    this.status = StudySessionStatus.Completed;
    this.completedAt = now;
  }
  skip(): void {
    if (this.status !== StudySessionStatus.Planned) throw conflict('Hanya sesi planned yang bisa dilewati');
    this.status = StudySessionStatus.Skipped;
  }
}

export class AiSummary {
  id!: string; userId!: string; title!: string;
  sourceContent!: string; summaryContent!: string; createdAt!: Date;
  constructor(p: Partial<AiSummary>) { Object.assign(this, p); }
}

export class SubscriptionPlan {
  id!: string; code!: string; name!: string; price!: number; currency!: string;
  durationDays!: number; isActive!: boolean; createdAt!: Date;
  constructor(p: Partial<SubscriptionPlan>) {
    Object.assign(this, p);
    this.price = Number(this.price); // numeric -> string di pg
  }

  endDateFrom(start: Date): Date {
    return new Date(start.getTime() + this.durationDays * 86_400_000);
  }
}

export class Transaction {
  id!: string; orderId!: string; userId!: string; planId!: string;
  amount!: number; currency!: string; status!: TransactionStatus;
  paymentMethod!: string | null; gatewayTransactionId!: string | null; paymentUrl!: string | null;
  expiresAt!: Date | null; paidAt!: Date | null; createdAt!: Date; updatedAt!: Date;
  constructor(p: Partial<Transaction>) {
    Object.assign(this, p);
    this.amount = Number(this.amount);
  }

  isPaid(): boolean { return this.status === TransactionStatus.Paid; }
  isExpired(now = new Date()): boolean {
    return this.status === TransactionStatus.Pending && !!this.expiresAt && this.expiresAt <= now;
  }
  amountMatches(gross: number): boolean { return Math.abs(this.amount - gross) < 0.005; }
  markPaid(method: string | null, at = new Date()): void {
    this.status = TransactionStatus.Paid;
    this.paidAt = at;
    if (method) this.paymentMethod = method;
  }
}

export class PaymentNotification {
  id!: string; transactionId!: string | null; gatewayEventId!: string;
  payload!: Record<string, unknown>; processed!: boolean; needsReview!: boolean;
  reviewNote!: string | null; receivedAt!: Date; processedAt!: Date | null;
  constructor(p: Partial<PaymentNotification>) { Object.assign(this, p); }
}

export class Subscription {
  id!: string; userId!: string; planId!: string; transactionId!: string;
  status!: SubscriptionStatus; startAt!: Date; endAt!: Date; createdAt!: Date;
  constructor(p: Partial<Subscription>) { Object.assign(this, p); }

  isActiveAt(now = new Date()): boolean {
    return this.status === SubscriptionStatus.Active && this.endAt > now;
  }
}

export class AdminAuditLog {
  id!: string; adminId!: string; targetUserId!: string | null;
  action!: string; note!: string | null; createdAt!: Date;
  constructor(p: Partial<AdminAuditLog>) { Object.assign(this, p); }
}

export class DashboardStats {
  totalUsers!: number; activeUsers!: number; totalSchedules!: number; totalSessions!: number;
  completedSessions!: number; completionRatePct!: number | null;
  constructor(p: Record<string, unknown>) {
    Object.assign(this, p);
    for (const k of ['totalUsers', 'activeUsers', 'totalSchedules', 'totalSessions', 'completedSessions'] as const) {
      this[k] = Number(this[k]);
    }
    this.completionRatePct = this.completionRatePct === null ? null : Number(this.completionRatePct);
  }
}
