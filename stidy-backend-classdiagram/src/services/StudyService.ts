import { withTx } from '../config/db';
import { badRequest, notFound } from '../config/errors';
import { StudySchedule, StudySession } from '../domain/entities';
import { StudySessionStatus } from '../domain/enums';
import { ScheduleInput, StudyScheduleRepository } from '../repositories/StudyScheduleRepository';
import { StudySessionRepository } from '../repositories/StudySessionRepository';

export class StudyService {
  constructor(private schedules: StudyScheduleRepository, private sessions: StudySessionRepository) {}

  private validate(i: { startTime: Date; endTime: Date }) {
    if (i.endTime <= i.startTime) throw badRequest('end_time harus setelah start_time');
  }

  /** Membuat jadwal sekaligus sesi belajar berstatus planned (satu transaksi). */
  async createSchedule(userId: string, input: ScheduleInput): Promise<{ schedule: StudySchedule; session: StudySession }> {
    this.validate(input);
    return withTx(async (tx) => {
      const schedule = await this.schedules.create(userId, input, tx);
      const session = await this.sessions.create(schedule.id, userId, tx);
      return { schedule, session };
    });
  }

  listSchedules(userId: string, range: { from?: Date; to?: Date }) {
    return this.schedules.listByUser(userId, range);
  }

  async getSchedule(userId: string, id: string) {
    const s = await this.schedules.findByIdForUser(id, userId);
    if (!s) throw notFound('Jadwal tidak ditemukan');
    return s;
  }

  async updateSchedule(userId: string, id: string, patch: Partial<ScheduleInput>) {
    const s = await this.getSchedule(userId, id);
    Object.assign(s, Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)));
    this.validate(s);
    return this.schedules.update(s);
  }

  async deleteSchedule(userId: string, id: string) {
    if (!(await this.schedules.delete(id, userId))) throw notFound('Jadwal tidak ditemukan');
  }

  listSessions(userId: string, status?: StudySessionStatus) {
    return this.sessions.listByUser(userId, status);
  }

  async transition(userId: string, id: string, action: 'start' | 'complete' | 'skip') {
    const s = await this.sessions.findByIdForUser(id, userId);
    if (!s) throw notFound('Sesi tidak ditemukan');
    s[action](); // aturan transisi status ada di entity
    return this.sessions.save(s);
  }
}
