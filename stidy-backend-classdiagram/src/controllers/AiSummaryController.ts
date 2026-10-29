import { Request, Response } from 'express';
import { z } from 'zod';
import { AiSummaryService } from '../services/AiSummaryService';

const createSchema = z.object({ title: z.string().min(1).max(150), sourceContent: z.string().min(20).max(50_000) });

export class AiSummaryController {
  constructor(private service: AiSummaryService) {}

  create = async (req: Request, res: Response) => {
    const b = createSchema.parse(req.body);
    res.status(201).json(await this.service.create(req.user!.id, b.title, b.sourceContent));
  };
  list = async (req: Request, res: Response) => { res.json(await this.service.list(req.user!.id)); };
  get = async (req: Request, res: Response) => { res.json(await this.service.get(req.user!.id, req.params.id)); };
}
