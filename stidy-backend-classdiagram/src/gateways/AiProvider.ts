import { env } from '../config/env';
import { AppError } from '../config/errors';

export interface AiProvider {
  summarize(text: string): Promise<string>;
}

export class AnthropicProvider implements AiProvider {
  async summarize(text: string): Promise<string> {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.anthropicApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.aiModel,
        max_tokens: 1024,
        system: 'Ringkas materi belajar berikut dalam Bahasa Indonesia secara singkat, jelas, dan terstruktur.',
        messages: [{ role: 'user', content: text }],
      }),
    });
    if (!res.ok) throw new AppError(502, 'Layanan AI gagal merespons', 'AI_ERROR');
    const data = (await res.json()) as { content: { type: string; text?: string }[] };
    return data.content.filter((c) => c.type === 'text').map((c) => c.text).join('\n').trim();
  }
}
