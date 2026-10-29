import { Request, Response } from 'express';
import { z } from 'zod';
import { AccountStatus } from '../domain/enums';
import { AdminService } from '../services/AdminService';

const listSchema = z.object({
  status: z.nativeEnum(AccountStatus).optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});
const statusSchema = z.object({ status: z.nativeEnum(AccountStatus), note: z.string().max(500).optional() });

export class AdminController {
  constructor(private service: AdminService) {}

  stats = async (_req: Request, res: Response) => { res.json(await this.service.getDashboardStats()); };
  listUsers = async (req: Request, res: Response) => {
    const r = await this.service.listUsers(listSchema.parse(req.query));
    res.json({ total: r.total, items: r.items.map((u) => u.toPublic()) });
  };
  setUserStatus = async (req: Request, res: Response) => {
    const b = statusSchema.parse(req.body);
    const u = await this.service.setUserStatus(req.user!.id, req.params.id, b.status, b.note);
    res.json(u.toPublic());
  };
  auditLogs = async (req: Request, res: Response) => {
    const q = listSchema.parse(req.query);
    res.json(await this.service.listAuditLogs(q.limit, q.offset));
  };
  paymentsNeedingReview = async (_req: Request, res: Response) => {
    res.json(await this.service.listPaymentsNeedingReview());
  };
}
