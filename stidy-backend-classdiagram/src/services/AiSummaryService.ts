import { forbidden, notFound } from '../config/errors';
import { AiProvider } from '../gateways/AiProvider';
import { AiSummaryRepository } from '../repositories/AiSummaryRepository';
import { SubscriptionService } from './SubscriptionService';

export class AiSummaryService {
  constructor(
    private repo: AiSummaryRepository,
    private subscriptions: SubscriptionService,
    private ai: AiProvider,
  ) {}

  async create(userId: string, title: string, sourceContent: string) {
    if (!(await this.subscriptions.isPremium(userId))) throw forbidden('Fitur ringkasan AI khusus pengguna premium');
    const summary = await this.ai.summarize(sourceContent);
    return this.repo.create(userId, title, sourceContent, summary);
  }

  list(userId: string) { return this.repo.listByUser(userId); }

  async get(userId: string, id: string) {
    const s = await this.repo.findByIdForUser(id, userId);
    if (!s) throw notFound('Ringkasan tidak ditemukan');
    return s;
  }
}
