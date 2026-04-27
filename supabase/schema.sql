create extension if not exists "pgcrypto";

create type event_type as enum (
  'earnings_release',
  'provisional_earnings',
  'ir_meeting',
  'conference_call',
  'material_update',
  'webcast',
  'business_report',
  'unknown'
);

create type event_source as enum (
  'dart',
  'kind',
  'kirs',
  'company_ir',
  'manual'
);

create type event_status as enum (
  'scheduled',
  'confirmed',
  'changed',
  'cancelled',
  'completed',
  'unknown'
);

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  ticker text not null unique,
  name text not null,
  market text not null default 'UNKNOWN',
  sector text,
  homepage_url text,
  ir_url text,
  dart_corp_code text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  title text not null,
  event_type event_type not null default 'unknown',
  source event_source not null,
  source_url text not null,
  disclosed_at timestamptz,
  starts_at timestamptz not null,
  ends_at timestamptz,
  timezone text not null default 'Asia/Seoul',
  status event_status not null default 'unknown',
  location text,
  fiscal_period text,
  description text,
  dedupe_key text not null unique,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists materials (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  title text not null,
  material_type text not null default 'other',
  source event_source not null,
  source_url text not null,
  file_url text,
  published_at timestamptz,
  summary_status text not null default 'not_requested',
  summary_text text,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists watchlist (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_ref text not null default 'local-user',
  notify_telegram boolean not null default true,
  notify_email boolean not null default false,
  created_at timestamptz not null default now(),
  unique (company_id, user_ref)
);

create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  watchlist_id uuid not null references watchlist(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  channel text not null,
  status text not null default 'pending',
  error_message text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  unique (watchlist_id, event_id, channel)
);

create table if not exists crawl_logs (
  id uuid primary key default gen_random_uuid(),
  source event_source not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  fetched_count integer not null default 0,
  inserted_count integer not null default 0,
  updated_count integer not null default 0,
  skipped_duplicate_count integer not null default 0,
  error_message text,
  meta jsonb not null default '{}'::jsonb
);

create index if not exists idx_events_starts_at on events(starts_at);
create index if not exists idx_events_company_id on events(company_id);
create index if not exists idx_materials_event_id on materials(event_id);
create index if not exists idx_crawl_logs_started_at on crawl_logs(started_at desc);
