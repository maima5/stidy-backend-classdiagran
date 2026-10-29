import express from 'express';
import { MidtransGateway } from './gateways/MidtransGateway';
import { AnthropicProvider } from './gateways/AiProvider';
import { AdminController } from './controllers/AdminController';
import { AiSummaryController } from './controllers/AiSummaryController';
import { AuthController } from './controllers/AuthController';
import { PaymentController } from './controllers/PaymentController';
import { StudyController } from './controllers/StudyController';
import { AuthMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import { AdminRepository } from './repositories/AdminRepository';
import { AiSummaryRepository } from './repositories/AiSummaryRepository';
import { AuthSessionRepository } from './repositories/AuthSessionRepository';
import { PaymentNotificationRepository } from './repositories/PaymentNotificationRepository';
import { StudyScheduleRepository } from './repositories/StudyScheduleRepository';
import { StudySessionRepository } from './repositories/StudySessionRepository';
import { SubscriptionPlanRepository } from './repositories/SubscriptionPlanRepository';
import { SubscriptionRepository } from './repositories/SubscriptionRepository';
import { TransactionRepository } from './repositories/TransactionRepository';
import { UserRepository } from './repositories/UserRepository';
import { buildRoutes } from './routes';
import { AdminService } from './services/AdminService';
import { AiSummaryService } from './services/AiSummaryService';
import { AuthService } from './services/AuthService';
import { PaymentService } from './services/PaymentService';
import { StudyService } from './services/StudyService';
import { SubscriptionService } from './services/SubscriptionService';

export function buildApp() {
  // repositories
  const users = new UserRepository(), sessions = new AuthSessionRepository();
  const schedules = new StudyScheduleRepository(), studySessions = new StudySessionRepository();
  const summaries = new AiSummaryRepository(), plans = new SubscriptionPlanRepository();
  const trxs = new TransactionRepository(), notifs = new PaymentNotificationRepository();
  const subs = new SubscriptionRepository(), adminRepo = new AdminRepository();

  // services
  const authService = new AuthService(users, sessions);
  const subscriptionService = new SubscriptionService(subs, plans);
  const paymentService = new PaymentService(trxs, plans, users, notifs, subscriptionService, new MidtransGateway());
  const studyService = new StudyService(schedules, studySessions);
  const summaryService = new AiSummaryService(summaries, subscriptionService, new AnthropicProvider());
  const adminService = new AdminService(users, sessions, adminRepo, notifs);

  const app = express();
  app.use(express.json({ limit: '1mb' }));
  app.get('/health', (_req, res) => res.json({ ok: true }));
  app.use('/api', buildRoutes({
    auth: new AuthController(authService),
    study: new StudyController(studyService),
    summary: new AiSummaryController(summaryService),
    payment: new PaymentController(paymentService, subscriptionService),
    admin: new AdminController(adminService),
    mw: new AuthMiddleware(authService, users, subscriptionService),
  }));
  app.use(errorHandler);
  return { app, subscriptionService };
}
