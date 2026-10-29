-- =====================================================================
-- S-Tidy: Data Dummy (5 baris per tabel)
-- Jalankan SETELAH stidy_schema.sql
-- Password semua akun dummy: password123 (hash bcrypt)
-- =====================================================================

-- (Opsional) kosongkan data lama sebelum seed ulang:
-- truncate admin_audit_logs, subscriptions, payment_notifications, transactions,
--          subscription_plans, ai_summaries, study_sessions, study_schedules,
--          auth_sessions, users restart identity cascade;

-- ---------- 1. users ----------
insert into users (id, name, email, password_hash, role, status, last_login_at, created_at) values
('a1000000-0000-0000-0000-000000000001', 'Admin S-Tidy',     'admin@stidy.id',            '$2b$10$IrzppP9MiYjdJjWB2/khBO8E9UPvyU3NBSL6.U/SSL4uDEDm7x1fS', 'admin', 'active',   '2026-10-21 07:30+07', '2026-08-01 09:00+07'),
('a1000000-0000-0000-0000-000000000002', 'Rani Putri',       'rani.putri@example.com',    '$2b$10$IrzppP9MiYjdJjWB2/khBO8E9UPvyU3NBSL6.U/SSL4uDEDm7x1fS', 'user',  'active',   '2026-10-21 06:45+07', '2026-08-05 10:15+07'),
('a1000000-0000-0000-0000-000000000003', 'Dimas Pratama',    'dimas.pratama@example.com', '$2b$10$IrzppP9MiYjdJjWB2/khBO8E9UPvyU3NBSL6.U/SSL4uDEDm7x1fS', 'user',  'active',   '2026-10-20 21:10+07', '2026-08-12 14:20+07'),
('a1000000-0000-0000-0000-000000000004', 'Salsa Nabila',     'salsa.nabila@example.com',  '$2b$10$IrzppP9MiYjdJjWB2/khBO8E9UPvyU3NBSL6.U/SSL4uDEDm7x1fS', 'user',  'active',   '2026-10-19 18:05+07', '2026-08-18 08:40+07'),
('a1000000-0000-0000-0000-000000000005', 'Fajar Ramadhan',   'fajar.ramadhan@example.com','$2b$10$IrzppP9MiYjdJjWB2/khBO8E9UPvyU3NBSL6.U/SSL4uDEDm7x1fS', 'user',  'inactive', '2026-10-09 16:30+07', '2026-08-20 11:55+07');

-- ---------- 2. auth_sessions ----------
insert into auth_sessions (id, user_id, token_hash, user_agent, ip_address, expires_at, revoked_at, created_at) values
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', '80b3ad2d438bfafa1ea690c5a59f54548dcc76ad6a839c6704ac1d9d565d9c80', 'Mozilla/5.0 (Windows NT 10.0) Chrome/130', '103.10.20.1',  '2026-10-28 07:30+07', null,                   '2026-10-21 07:30+07'),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', '8690c3af015e6294ff67fcfd334f181a4704b579e9b2bce79ec9716ac62da2d6', 'Mozilla/5.0 (Android 14) Chrome/130',      '114.5.60.12',  '2026-10-28 06:45+07', null,                   '2026-10-21 06:45+07'),
('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', '0de90da5aa026ef0c704b7a7c6eed5981af4f7c5c95539afc605a621f39e1c13', 'Mozilla/5.0 (Macintosh) Safari/17',        '36.72.18.99',  '2026-10-27 21:10+07', null,                   '2026-10-20 21:10+07'),
('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', '479b2f01fa93f6cf14c1e3bb176cd5df8c29c6b8eb164ea2962984d61f667996', 'Mozilla/5.0 (iPhone) Safari/17',           '180.254.7.45', '2026-10-26 18:05+07', null,                   '2026-10-19 18:05+07'),
('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', '49d693e562a620cc90f573147e197995ba9489a1bbaf7d4852e96b127a032a13', 'Mozilla/5.0 (Windows NT 10.0) Firefox/131','125.160.3.77', '2026-10-16 16:30+07', '2026-10-10 09:00+07', '2026-10-09 16:30+07');

-- ---------- 3. study_schedules ----------
insert into study_schedules (id, user_id, title, description, start_time, end_time, created_at) values
('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Belajar Logika Matematika',            'CNF, DNF, dan resolusi',                    '2026-10-22 19:00+07', '2026-10-22 21:00+07', '2026-10-18 10:00+07'),
('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Latihan Soal Jaringan Komputer',       'Subnetting dan routing',                    '2026-10-23 16:00+07', '2026-10-23 17:30+07', '2026-10-18 10:05+07'),
('c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Review Machine Learning',              'Klasifikasi dan evaluasi model',            '2026-10-21 20:00+07', '2026-10-21 22:00+07', '2026-10-17 15:30+07'),
('c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Praktikum Pemrograman Web',            'Membuat REST API dengan Express',           '2026-10-24 09:00+07', '2026-10-24 11:00+07', '2026-10-19 08:00+07'),
('c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Persiapan UTS Rekayasa Perangkat Lunak','Use case dan diagram aktivitas',           '2026-10-12 19:30+07', '2026-10-12 21:00+07', '2026-10-08 12:00+07');

-- ---------- 4. study_sessions ----------
insert into study_sessions (id, schedule_id, user_id, status, started_at, completed_at, created_at) values
('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'planned',     null,                  null,                  '2026-10-18 10:00+07'),
('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'planned',     null,                  null,                  '2026-10-18 10:05+07'),
('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'in_progress', '2026-10-21 20:02+07', null,                  '2026-10-17 15:30+07'),
('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'planned',     null,                  null,                  '2026-10-19 08:00+07'),
('d1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'completed',   '2026-10-12 19:30+07', '2026-10-12 20:55+07', '2026-10-08 12:00+07');

-- ---------- 5. ai_summaries ----------
insert into ai_summaries (id, user_id, title, source_content, summary_content, created_at) values
('e1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Ringkasan CNF dan DNF',        'CNF adalah konjungsi dari klausa, dan tiap klausa adalah disjungsi literal. DNF adalah kebalikannya.', 'CNF = AND dari OR-OR. DNF = OR dari AND-AND.', '2026-10-15 20:00+07'),
('e1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Ringkasan Logika Predikat',    'Kuantor universal dan eksistensial; urutan kuantor memengaruhi makna pernyataan.',                     'Urutan kuantor penting: forall-exists tidak sama dengan exists-forall.', '2026-10-17 21:30+07'),
('e1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'Ringkasan Evaluasi Model',      'Akurasi, presisi, recall, dan F1-score digunakan untuk menilai model klasifikasi.',                     'Gunakan F1-score saat kelas tidak seimbang.', '2026-10-18 19:45+07'),
('e1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Ringkasan REST API',            'REST memakai metode HTTP (GET, POST, PUT, DELETE) untuk mengelola resource.',                           'REST: resource + metode HTTP + kode status.', '2026-10-19 10:20+07'),
('e1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 'Ringkasan Resolusi Propositional','Resolusi menggabungkan dua klausa yang memuat literal komplementer.',                                'Hapus literal komplementer, gabungkan sisanya.', '2026-10-20 22:10+07');

-- ---------- 6. subscription_plans ----------
insert into subscription_plans (id, code, name, price, currency, duration_days, is_active, created_at) values
('f1000000-0000-0000-0000-000000000001', 'premium_weekly',    'Premium Mingguan',  15000.00, 'IDR',   7, true, '2026-08-01 09:00+07'),
('f1000000-0000-0000-0000-000000000002', 'premium_monthly',   'Premium Bulanan',   49000.00, 'IDR',  30, true, '2026-08-01 09:00+07'),
('f1000000-0000-0000-0000-000000000003', 'premium_quarterly', 'Premium 3 Bulan',  129000.00, 'IDR',  90, true, '2026-08-01 09:00+07'),
('f1000000-0000-0000-0000-000000000004', 'premium_semester',  'Premium 6 Bulan',  239000.00, 'IDR', 180, true, '2026-08-01 09:00+07'),
('f1000000-0000-0000-0000-000000000005', 'premium_yearly',    'Premium Tahunan',  449000.00, 'IDR', 365, true, '2026-08-01 09:00+07');

-- ---------- 7. transactions ----------
insert into transactions (id, order_id, user_id, plan_id, amount, currency, status, payment_method, gateway_transaction_id, payment_url, expires_at, paid_at, created_at) values
('91000000-0000-0000-0000-000000000001', 'STIDY-20260901-0001', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002',  49000.00, 'IDR', 'paid', 'gopay',     'gw-7f3a1c01', 'https://pay.example.com/t/7f3a1c01', '2026-09-02 08:00+07', '2026-09-01 08:05+07', '2026-09-01 08:00+07'),
('91000000-0000-0000-0000-000000000002', 'STIDY-20261002-0002', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002',  49000.00, 'IDR', 'paid', 'qris',      'gw-7f3a1c02', 'https://pay.example.com/t/7f3a1c02', '2026-10-03 08:00+07', '2026-10-02 08:03+07', '2026-10-02 08:00+07'),
('91000000-0000-0000-0000-000000000003', 'STIDY-20261005-0003', 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', 129000.00, 'IDR', 'paid', 'bca_va',    'gw-7f3a1c03', 'https://pay.example.com/t/7f3a1c03', '2026-10-06 12:00+07', '2026-10-05 12:20+07', '2026-10-05 12:00+07'),
('91000000-0000-0000-0000-000000000004', 'STIDY-20261001-0004', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001',  15000.00, 'IDR', 'paid', 'ovo',       'gw-7f3a1c04', 'https://pay.example.com/t/7f3a1c04', '2026-10-02 18:00+07', '2026-10-01 18:07+07', '2026-10-01 18:00+07'),
('91000000-0000-0000-0000-000000000005', 'STIDY-20260820-0005', 'a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', 449000.00, 'IDR', 'paid', 'shopeepay', 'gw-7f3a1c05', 'https://pay.example.com/t/7f3a1c05', '2026-08-21 11:00+07', '2026-08-20 11:10+07', '2026-08-20 11:00+07');

-- ---------- 8. payment_notifications ----------
insert into payment_notifications (id, transaction_id, gateway_event_id, payload, processed, needs_review, review_note, received_at, processed_at) values
('a2000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'evt-0001', '{"order_id":"STIDY-20260901-0001","status":"settlement","gross_amount":"49000.00"}',  true,  false, null, '2026-09-01 08:05+07', '2026-09-01 08:05+07'),
('a2000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', 'evt-0002', '{"order_id":"STIDY-20261002-0002","status":"settlement","gross_amount":"49000.00"}',  true,  false, null, '2026-10-02 08:03+07', '2026-10-02 08:03+07'),
('a2000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000003', 'evt-0003', '{"order_id":"STIDY-20261005-0003","status":"settlement","gross_amount":"129000.00"}', true,  false, null, '2026-10-05 12:20+07', '2026-10-05 12:20+07'),
('a2000000-0000-0000-0000-000000000004', '91000000-0000-0000-0000-000000000004', 'evt-0004', '{"order_id":"STIDY-20261001-0004","status":"settlement","gross_amount":"15000.00"}',  true,  false, null, '2026-10-01 18:07+07', '2026-10-01 18:07+07'),
('a2000000-0000-0000-0000-000000000005', null,      'evt-0005', '{"order_id":"STIDY-20261015-9999","status":"settlement","gross_amount":"49000.00"}',  false, true,  'order_id tidak ditemukan di tabel transactions, premium tidak diaktifkan', '2026-10-15 10:00+07', null);

-- ---------- 9. subscriptions ----------
insert into subscriptions (id, user_id, plan_id, transaction_id, status, start_at, end_at, created_at) values
('a3000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000001', 'expired',   '2026-09-01 08:05+07', '2026-10-01 08:05+07', '2026-09-01 08:05+07'),
('a3000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'f1000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', 'active',    '2026-10-02 08:03+07', '2026-11-01 08:03+07', '2026-10-02 08:03+07'),
('a3000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'f1000000-0000-0000-0000-000000000003', '91000000-0000-0000-0000-000000000003', 'active',    '2026-10-05 12:20+07', '2027-01-03 12:20+07', '2026-10-05 12:20+07'),
('a3000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'f1000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000004', 'expired',   '2026-10-01 18:07+07', '2026-10-08 18:07+07', '2026-10-01 18:07+07'),
('a3000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'f1000000-0000-0000-0000-000000000005', '91000000-0000-0000-0000-000000000005', 'cancelled', '2026-08-20 11:10+07', '2027-08-20 11:10+07', '2026-08-20 11:10+07');

-- ---------- 10. admin_audit_logs ----------
insert into admin_audit_logs (id, admin_id, target_user_id, action, note, created_at) values
('a4000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'deactivate_user', 'Akun dilaporkan, ditinjau sementara',         '2026-09-20 10:00+07'),
('a4000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000004', 'activate_user',   'Tinjauan selesai, akun diaktifkan kembali',    '2026-09-22 09:30+07'),
('a4000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000005', 'deactivate_user', 'Permintaan pengguna',                          '2026-10-10 09:00+07'),
('a4000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'deactivate_user', 'Verifikasi email gagal',                       '2026-10-12 11:00+07'),
('a4000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 'activate_user',   'Verifikasi email berhasil',                    '2026-10-12 15:20+07');

-- ---------- Cek hasil ----------
select 'users' t, count(*) from users union all select 'auth_sessions', count(*) from auth_sessions
union all select 'study_schedules', count(*) from study_schedules union all select 'study_sessions', count(*) from study_sessions
union all select 'ai_summaries', count(*) from ai_summaries union all select 'subscription_plans', count(*) from subscription_plans
union all select 'transactions', count(*) from transactions union all select 'payment_notifications', count(*) from payment_notifications
union all select 'subscriptions', count(*) from subscriptions union all select 'admin_audit_logs', count(*) from admin_audit_logs;
