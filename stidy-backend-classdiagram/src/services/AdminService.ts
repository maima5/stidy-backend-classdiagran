import { withTx } from '../config/db';
import { badRequest, notFound } from '../config/errors';
import { AccountStatus } from '../domain/enums';
import { AdminRepository } from '../repositories/AdminRepository';
import { AuthSessionRepository } from '../repositories/AuthSessionRepository';
import { PaymentNotificationRepository } from '../repositories/PaymentNotificationRepository';
import { UserRepository } from '../repositories/UserRepository';

export class AdminService {
  constructor(
    private users: UserRepository,
    private sessions: AuthSessionRepository,
    private admin: AdminRepository,
    private notifs: PaymentNotificationRepository,
  ) {}

  getDashboardStats() { return this.admin.getDashboardStats(); }
  listPaymentsNeedingReview() { return this.notifs.listNeedsReview(); }
  listAuditLogs(limit: number, offset: number) { return this.admin.listAuditLogs(limit, offset); }
  listUsers(opts: { status?: AccountStatus; search?: string; limit: number; offset: number }) {
    return this.users.list(opts);
  }

  /** Aktif/nonaktifkan akun + catat audit log; menonaktifkan akan mencabut semua sesi login. */
  async setUserStatus(adminId: string, targetId: string, status: AccountStatus, note?: string) {
    if (adminId === targetId) throw badRequest('Admin tidak dapat mengubah status akunnya sendiri');
    return withTx(async (tx) => {
      const target = await this.users.findById(targetId, tx);
      if (!target) throw notFound('User tidak ditemukan');
      if (target.isAdmin()) throw badRequest('Akun admin tidak dapat diubah dari endpoint ini');
      const updated = await this.users.updateStatus(targetId, status, tx);
      if (status === AccountStatus.Inactive) await this.sessions.revokeAllForUser(targetId, tx);
      await this.admin.addAuditLog(adminId, targetId,
        status === AccountStatus.Active ? 'activate_user' : 'deactivate_user', note ?? null, tx);
      return updated!;
    });
  }
}
