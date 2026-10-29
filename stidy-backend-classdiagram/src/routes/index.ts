import { Router } from 'express';
import { asyncHandler as h, AuthMiddleware } from '../middleware/auth';
import { AdminController } from '../controllers/AdminController';
import { AiSummaryController } from '../controllers/AiSummaryController';
import { AuthController } from '../controllers/AuthController';
import { PaymentController } from '../controllers/PaymentController';
import { StudyController } from '../controllers/StudyController';

export interface Controllers {
  auth: AuthController; study: StudyController; summary: AiSummaryController;
  payment: PaymentController; admin: AdminController; mw: AuthMiddleware;
}

export function buildRoutes(c: Controllers): Router {
  const r = Router();
  const { authenticate, requireAdmin, requirePremium } = c.mw;

  // Auth
  r.post('/auth/register', h(c.auth.register));
  r.post('/auth/login', h(c.auth.login));
  r.post('/auth/refresh', h(c.auth.refresh));
  r.post('/auth/logout', h(c.auth.logout));
  r.get('/auth/me', authenticate, h(c.auth.me));

  // Jadwal & sesi belajar
  r.post('/schedules', authenticate, h(c.study.createSchedule));
  r.get('/schedules', authenticate, h(c.study.listSchedules));
  r.get('/schedules/:id', authenticate, h(c.study.getSchedule));
  r.patch('/schedules/:id', authenticate, h(c.study.updateSchedule));
  r.delete('/schedules/:id', authenticate, h(c.study.deleteSchedule));
  r.get('/sessions', authenticate, h(c.study.listSessions));
  r.post('/sessions/:id/start', authenticate, h(c.study.transition('start')));
  r.post('/sessions/:id/complete', authenticate, h(c.study.transition('complete')));
  r.post('/sessions/:id/skip', authenticate, h(c.study.transition('skip')));

  // Ringkasan AI (premium)
  r.post('/summaries', authenticate, requirePremium, h(c.summary.create));
  r.get('/summaries', authenticate, h(c.summary.list));
  r.get('/summaries/:id', authenticate, h(c.summary.get));

  // Premium & pembayaran
  r.get('/plans', h(c.payment.listPlans));
  r.post('/payments/checkout', authenticate, h(c.payment.checkout));
  r.get('/payments/transactions', authenticate, h(c.payment.listTransactions));
  r.get('/payments/transactions/:id', authenticate, h(c.payment.getTransaction));
  r.get('/subscription/me', authenticate, h(c.payment.mySubscription));
  r.post('/payments/notification', h(c.payment.notification)); // webhook

  // Admin
  r.get('/admin/stats', authenticate, requireAdmin, h(c.admin.stats));
  r.get('/admin/users', authenticate, requireAdmin, h(c.admin.listUsers));
  r.patch('/admin/users/:id/status', authenticate, requireAdmin, h(c.admin.setUserStatus));
  r.get('/admin/audit-logs', authenticate, requireAdmin, h(c.admin.auditLogs));
  r.get('/admin/payment-notifications/review', authenticate, requireAdmin, h(c.admin.paymentsNeedingReview));
  return r;
}
