import { Db, pool, queryAll, queryOne } from '../config/db';
import { StudySession } from '../domain/entities';
import { StudySessionStatus } from '../domain/enums';

export class StudySessionRepository {
  create(scheduleId: string, userId: string, db: Db = pool) {
    return queryOne(db, StudySession,
      'insert into study_sessions (schedule_id, user_id) values ($1,$2) returning *',
      [scheduleId, userId]) as Promise<StudySession>;
  }
  findByIdForUser(id: string, userId: string, db: Db = pool) {
    return queryOne(db, StudySession, 'select * from study_sessions where id = $1 and user_id = $2', [id, userId]);
  }
  listByUser(userId: string, status?: StudySessionStatus, db: Db = pool) {
    const params: unknown[] = [userId];
    let sql = 'select * from study_sessions where user_id = $1';
    if (status) { params.push(status); sql += ' and status = $2'; }
    return queryAll(db, StudySession, sql + ' order by created_at desc', params);
  }
  save(s: StudySession, db: Db = pool) {
    return queryOne(db, StudySession,
      'update study_sessions set status=$2, started_at=$3, completed_at=$4 where id=$1 returning *',
      [s.id, s.status, s.startedAt, s.completedAt]) as Promise<StudySession>;
  }
}
