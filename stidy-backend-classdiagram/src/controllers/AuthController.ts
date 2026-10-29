import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthService } from '../services/AuthService';

const registerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  password: z.string().min(8).max(72),
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });
const tokenSchema = z.object({ refreshToken: z.string().min(1) });

export class AuthController {
  constructor(private service: AuthService) {}

  private client = (req: Request) => ({ userAgent: req.headers['user-agent'], ipAddress: req.ip });

  register = async (req: Request, res: Response) => {
    const b = registerSchema.parse(req.body);
    const user = await this.service.register(b.name, b.email, b.password);
    res.status(201).json(user.toPublic());
  };
  login = async (req: Request, res: Response) => {
    const b = loginSchema.parse(req.body);
    const r = await this.service.login(b.email, b.password, this.client(req));
    res.json({ user: r.user.toPublic(), accessToken: r.accessToken, refreshToken: r.refreshToken });
  };
  refresh = async (req: Request, res: Response) => {
    const { refreshToken } = tokenSchema.parse(req.body);
    const r = await this.service.refresh(refreshToken, this.client(req));
    res.json({ accessToken: r.accessToken, refreshToken: r.refreshToken });
  };
  logout = async (req: Request, res: Response) => {
    await this.service.logout(tokenSchema.parse(req.body).refreshToken);
    res.status(204).end();
  };
  me = async (req: Request, res: Response) => { res.json(req.user!.toPublic()); };
}
