import { Db, pool, queryAll, queryOne } from '../config/db';
import { StudySchedule } from '../domain/entities';

export interface ScheduleInput { title: string; description?: string | null; startTime: Date; endTime: Date }

export class StudyScheduleRepository {
  create(userId: string, d: ScheduleInput, db: Db = pool) {
    return queryOne(db, StudySchedule,
      `insert into study_schedules (user_id, title, description, start_time, end_time)
       values ($1,$2,$3,$4,$5) returning *`,
      [userId, d.title, d.description ?? null, d.startTime, d.endTime]) as Promise<StudySchedule>;
  }
  findByIdForUser(id: string, userId: string, db: Db = pool) {
    return queryOne(db, StudySchedule, 'select * from study_schedules where id = $1 and user_id = $2', [id, userId]);
  }
  listByUser(userId: string, range: { from?: Date; to?: Date }, db: Db = pool) {
    const params: unknown[] = [userId];
    let sql = 'select * from study_schedules where user_id = $1';
    if (range.from) { params.push(range.from); sql += ` and end_time >= $${params.length}`; }
    if (range.to) { params.push(range.to); sql += ` and start_time <= $${params.length}`; }
    return queryAll(db, StudySchedule, sql + ' order by start_time', params);
  }
  update(s: StudySchedule, db: Db = pool) {
    return queryOne(db, StudySchedule,
      `update study_schedules set title=$2, description=$3, start_time=$4, end_time=$5
       where id=$1 returning *`,
      [s.id, s.title, s.description, s.startTime, s.endTime]) as Promise<StudySchedule>;
  }
  async delete(id: string, userId: string, db: Db = pool) {
    const r = await db.query('delete from study_schedules where id = $1 and user_id = $2', [id, userId]);
    return (r.rowCount ?? 0) > 0;
  }
}
