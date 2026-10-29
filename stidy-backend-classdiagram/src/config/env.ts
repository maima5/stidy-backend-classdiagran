import 'dotenv/config';

const req = (k: string): string => {
  const v = process.env[k];
  if (!v) throw new Error(`Env ${k} wajib diisi`);
  return v;
};

export const env = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: req('DATABASE_URL'),
  jwtSecret: req('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  refreshTtlDays: Number(process.env.REFRESH_TTL_DAYS ?? 7),
  midtransServerKey: process.env.MIDTRANS_SERVER_KEY ?? '',
  midtransBaseUrl: process.env.MIDTRANS_BASE_URL ?? 'https://app.sandbox.midtrans.com',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
  aiModel: process.env.AI_MODEL ?? 'claude-sonnet-5-5',
};
