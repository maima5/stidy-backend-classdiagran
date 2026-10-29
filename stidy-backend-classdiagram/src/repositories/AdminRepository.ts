import { Db, pool, queryAll, queryOne } from '../config/db';
import { AdminAuditLog, DashboardStats } from '../domain/entities';

export class AdminRepository {
  addAuditLog(adminId: string, targetUserId: string | null, action: string, note: string | null, db: Db = pool) {
    return queryOne(db, AdminAuditLog,
      'insert into admin_audit_logs (admin_id, target_user_id, action, note) values ($1,$2,$3,$4) returning *',
      [adminId, targetUserId, action, note]) as Promise<AdminAuditLog>;
  }
  listAuditLogs(limit: number, offset: number, db: Db = pool) {
    return queryAll(db, AdminAuditLog,
      'select * from admin_audit_logs order by created_at desc limit $1 offset $2', [limit, offset]);
  }
  getDashboardStats(db: Db = pool) {
    return queryOne(db, DashboardStats, 'select * from admin_dashboard_stats') as Promise<DashboardStats>;
  }
}
