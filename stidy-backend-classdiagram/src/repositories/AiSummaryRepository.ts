import { Db, pool, queryAll, queryOne } from '../config/db';
import { AiSummary } from '../domain/entities';

export class AiSummaryRepository {
  create(userId: string, title: string, source: string, summary: string, db: Db = pool) {
    return queryOne(db, AiSummary,
      `insert into ai_summaries (user_id, title, source_content, summary_content)
       values ($1,$2,$3,$4) returning *`, [userId, title, source, summary]) as Promise<AiSummary>;
  }
  listByUser(userId: string, db: Db = pool) {
    return queryAll(db, AiSummary, 'select * from ai_summaries where user_id = $1 order by created_at desc', [userId]);
  }
  findByIdForUser(id: string, userId: string, db: Db = pool) {
    return queryOne(db, AiSummary, 'select * from ai_summaries where id = $1 and user_id = $2', [id, userId]);
  }
}
