# S-Tidy Backend

Node.js + TypeScript + Express + PostgreSQL (`pg`). Mengikuti `stidy_schema.sql`.

1. `psql -f stidy_schema.sql` lalu `psql -f stidy_seed.sql`
2. `cp .env.example .env` dan isi nilainya
3. `npm install && npm run dev`

Arsitektur: Controller -> Service -> Repository -> PostgreSQL. Aturan bisnis ada di Service dan Entity.
Backend harus terhubung dengan role database yang melewati RLS (owner / service role), karena
semua tabel mengaktifkan RLS dan otorisasi dilakukan di backend.
Akun seed: password `password123` (admin@stidy.id untuk admin).
