-- ---------- ENUM ----------
create type user_role           as enum ('user', 'admin');
create type account_status      as enum ('active', 'inactive');
create type study_session_status as enum ('planned', 'in_progress', 'completed', 'skipped');
create type transaction_status  as enum ('pending', 'paid', 'failed', 'expired');
create type subscription_status as enum ('active', 'expired', 'cancelled');

-- ---------- Helper: auto-update updated_at ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table users (
  id            uuid primary key default gen_random_uuid(),
  name          varchar(100)   not null,
  email         varchar(255)   not null,
  password_hash text           not null,              -- bcrypt/argon2, jangan simpan password asli
  role          user_role      not null default 'user',
  status        account_status not null default 'active',  -- diubah admin (aktif/nonaktif)
  last_login_at timestamptz,
  created_at    timestamptz    not null default now(),
  updated_at    timestamptz    not null default now()
);
create unique index users_email_uq on users (lower(email));
create index users_status_idx on users (status);
create trigger users_updated before update on users
  for each row execute function set_updated_at();

-- Refresh token / session (simpan HASH token-nya, bukan token mentah)
create table auth_sessions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  token_hash  text not null unique,
  user_agent  text,
  ip_address  inet,
  expires_at  timestamptz not null,
  revoked_at  timestamptz,
  created_at  timestamptz not null default now()
);
create index auth_sessions_user_idx on auth_sessions (user_id);

-- =====================================================================
-- 2. JADWAL & SESI BELAJAR
-- =====================================================================
create table study_schedules (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  title       varchar(150) not null,
  description text,
  start_time  timestamptz  not null,
  end_time    timestamptz  not null,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now(),
  constraint study_schedules_time_chk check (end_time > start_time)
);
create index study_schedules_user_idx on study_schedules (user_id, start_time);
create trigger study_schedules_updated before update on study_schedules
  for each row execute function set_updated_at();

create table study_sessions (
  id           uuid primary key default gen_random_uuid(),
  schedule_id  uuid not null references study_schedules(id) on delete cascade,
  user_id      uuid not null references users(id) on delete cascade,
  status       study_session_status not null default 'planned',
  started_at   timestamptz,
  completed_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index study_sessions_user_idx     on study_sessions (user_id);
create index study_sessions_schedule_idx on study_sessions (schedule_id);
create index study_sessions_status_idx   on study_sessions (status);
create trigger study_sessions_updated before update on study_sessions
  for each row execute function set_updated_at();

-- =====================================================================
-- 3. RINGKASAN AI (fitur premium; pengecekan premium dilakukan di backend)
-- =====================================================================
create table ai_summaries (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  title            varchar(150) not null,
  source_content   text not null,
  summary_content  text not null,
  created_at       timestamptz not null default now()
);
create index ai_summaries_user_idx on ai_summaries (user_id, created_at desc);

-- =====================================================================
-- 4. PREMIUM, PEMBAYARAN, PAYMENT GATEWAY
-- =====================================================================
create table subscription_plans (
  id            uuid primary key default gen_random_uuid(),
  code          varchar(50)  not null unique,        -- contoh: 'premium_monthly'
  name          varchar(100) not null,
  price         numeric(12,2) not null check (price >= 0),
  currency      char(3)      not null default 'IDR',
  duration_days int          not null check (duration_days > 0),
  is_active     boolean      not null default true,
  created_at    timestamptz  not null default now()
);

-- Satu percobaan pembayaran = satu baris. Retry setelah gagal/kedaluwarsa = baris baru.
create table transactions (
  id                     uuid primary key default gen_random_uuid(),
  order_id               varchar(100) not null unique,   -- order id yang dikirim ke gateway
  user_id                uuid not null references users(id),
  plan_id                uuid not null references subscription_plans(id),
  amount                 numeric(12,2) not null check (amount >= 0),
  currency               char(3)  not null default 'IDR',
  status                 transaction_status not null default 'pending',
  payment_method         varchar(50),
  gateway_transaction_id varchar(100),
  payment_url            text,                           -- supaya detail transaksi pending bisa dibuka lagi
  expires_at             timestamptz,
  paid_at                timestamptz,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index transactions_user_idx   on transactions (user_id, created_at desc);
create index transactions_status_idx on transactions (status);
create trigger transactions_updated before update on transactions
  for each row execute function set_updated_at();

-- Log semua notifikasi gateway (idempotensi + audit amount/status mismatch)
create table payment_notifications (
  id               uuid primary key default gen_random_uuid(),
  transaction_id   uuid references transactions(id) on delete set null,
  gateway_event_id varchar(150) not null unique,         -- notifikasi duplikat ditolak oleh unique ini
  payload          jsonb not null,
  processed        boolean not null default false,
  needs_review     boolean not null default false,       -- true jika amount/status tidak cocok
  review_note      text,
  received_at      timestamptz not null default now(),
  processed_at     timestamptz
);
create index payment_notifications_trx_idx    on payment_notifications (transaction_id);
create index payment_notifications_review_idx on payment_notifications (needs_review) where needs_review;

-- transaction_id UNIQUE: satu transaksi hanya bisa mengaktifkan premium sekali
-- (mencegah periode aktif bertambah dua kali saat notifikasi duplikat)
create table subscriptions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references users(id) on delete cascade,
  plan_id        uuid not null references subscription_plans(id),
  transaction_id uuid not null unique references transactions(id),
  status         subscription_status not null default 'active',
  start_at       timestamptz not null,
  end_at         timestamptz not null,
  created_at     timestamptz not null default now(),
  constraint subscriptions_time_chk check (end_at > start_at)
);
create index subscriptions_user_idx on subscriptions (user_id, end_at desc);

-- =====================================================================
-- 5. ADMIN
-- =====================================================================
create table admin_audit_logs (
  id             uuid primary key default gen_random_uuid(),
  admin_id       uuid not null references users(id),
  target_user_id uuid references users(id) on delete set null,
  action         varchar(50) not null,                   -- 'activate_user', 'deactivate_user', dst.
  note           text,
  created_at     timestamptz not null default now()
);
create index admin_audit_logs_admin_idx on admin_audit_logs (admin_id, created_at desc);

-- =====================================================================
-- 6. VIEW & FUNCTION
-- =====================================================================
-- Statistik Dashboard Admin
create view admin_dashboard_stats with (security_invoker = true) as
select
  (select count(*) from users where role = 'user')                        as total_users,
  (select count(*) from users where role = 'user' and status = 'active')  as active_users,
  (select count(*) from study_schedules)                                  as total_schedules,
  (select count(*) from study_sessions)                                   as total_sessions,
  (select count(*) from study_sessions where status = 'completed')        as completed_sessions,
  round(
    100.0 * (select count(*) from study_sessions where status = 'completed')
    / nullif((select count(*) from study_sessions), 0), 2)                as completion_rate_pct;

-- Cek apakah user sedang premium
create or replace function is_premium(p_user_id uuid) returns boolean
language sql stable as $$
  select exists (
    select 1 from subscriptions
    where user_id = p_user_id and status = 'active' and end_at > now()
  );
$$;

alter table users                 enable row level security;
alter table auth_sessions         enable row level security;
alter table study_schedules       enable row level security;
alter table study_sessions        enable row level security;
alter table ai_summaries          enable row level security;
alter table subscription_plans    enable row level security;
alter table transactions          enable row level security;
alter table payment_notifications enable row level security;
alter table subscriptions         enable row level security;
alter table admin_audit_logs      enable row level security;
