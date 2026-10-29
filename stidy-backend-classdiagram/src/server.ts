import { env } from './config/env';
import { buildApp } from './app';

const { app, subscriptionService } = buildApp();

// Tandai langganan yang sudah lewat masa aktif (tiap 10 menit)
setInterval(() => {
  subscriptionService.expireOverdue().catch((e) => console.error('expireOverdue gagal', e));
}, 10 * 60 * 1000);

app.listen(env.port, () => console.log(`S-Tidy API berjalan di :${env.port}`));
