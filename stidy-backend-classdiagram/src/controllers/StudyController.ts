import { Request, Response } from 'express';
import { z } from 'zod';
import { StudySessionStatus } from '../domain/enums';
import { StudyService } from '../services/StudyService';

const scheduleSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().nullish(),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
});
const rangeSchema = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });
const statusSchema = z.object({ status: z.nativeEnum(StudySessionStatus).optional() });

export class StudyController {
  constructor(private service: StudyService) {}

  createSchedule = async (req: Request, res: Response) => {
    res.status(201).json(await this.service.createSchedule(req.user!.id, scheduleSchema.parse(req.body)));
  };
  listSchedules = async (req: Request, res: Response) => {
    res.json(await this.service.listSchedules(req.user!.id, rangeSchema.parse(req.query)));
  };
  getSchedule = async (req: Request, res: Response) => {
    res.json(await this.service.getSchedule(req.user!.id, req.params.id));
  };
  updateSchedule = async (req: Request, res: Response) => {
    res.json(await this.service.updateSchedule(req.user!.id, req.params.id, scheduleSchema.partial().parse(req.body)));
  };
  deleteSchedule = async (req: Request, res: Response) => {
    await this.service.deleteSchedule(req.user!.id, req.params.id);
    res.status(204).end();
  };
  listSessions = async (req: Request, res: Response) => {
    res.json(await this.service.listSessions(req.user!.id, statusSchema.parse(req.query).status));
  };
  transition = (action: 'start' | 'complete' | 'skip') => async (req: Request, res: Response) => {
    res.json(await this.service.transition(req.user!.id, req.params.id, action));
  };
}
