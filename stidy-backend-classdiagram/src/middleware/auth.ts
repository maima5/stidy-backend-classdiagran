import { NextFunction, Request, RequestHandler, Response } from 'express';
import { forbidden, unauthorized } from '../config/errors';
import { User } from '../domain/entities';
import { AuthService } from '../services/AuthService';
import { SubscriptionService } from '../services/SubscriptionService';
import { UserRepository } from '../repositories/UserRepository';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: User } }
}

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => { fn(req, res, next).catch(next); };

export class AuthMiddleware {
  constructor(
    private auth: AuthService,
    private users: UserRepository,
    private subscriptions: SubscriptionService,
  ) {}

  authenticate: RequestHandler = asyncHandler(async (req, _res, next) => {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer ')) throw unauthorized('Token tidak ada');
    const payload = this.auth.verifyAccessToken(h.slice(7));
    const user = await this.users.findById(payload.sub); // cek status terbaru (bisa dinonaktifkan admin)
    if (!user) throw unauthorized();
    if (!user.isActive()) throw forbidden('Akun dinonaktifkan');
    req.user = user;
    next();
  });

  requireAdmin: RequestHandler = (req, _res, next) =>
    req.user?.isAdmin() ? next() : next(forbidden('Hanya untuk admin'));

  requirePremium: RequestHandler = asyncHandler(async (req, _res, next) => {
    if (!(await this.subscriptions.isPremium(req.user!.id))) throw forbidden('Fitur khusus pengguna premium');
    next();
  });
}
