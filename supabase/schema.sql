-- TaskList - Supabase Database Schema
-- Run this in the Supabase Dashboard: SQL Editor → New query → paste & run

create extension if not exists "pgcrypto";

-- ─── FOLDERS ────────────────────────────────────────────────────────────────
create table public.folders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  color      text not null default '#3b82f6',
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.folders enable row level security;

create policy "Users manage own folders" on public.folders
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── CHECKLISTS ─────────────────────────────────────────────────────────────
create table public.checklists (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  folder_id  uuid not null references public.folders(id) on delete cascade,
  name       text not null,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.checklists enable row level security;

create policy "Users manage own checklists" on public.checklists
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── TASKS ───────────────────────────────────────────────────────────────────
create table public.tasks (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  title        text not null,
  completed    boolean not null default false,
  due_date     date,
  position     integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users manage own tasks" on public.tasks
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── INDEXES ─────────────────────────────────────────────────────────────────
create index on public.folders(user_id);
create index on public.checklists(user_id);
create index on public.checklists(folder_id);
create index on public.tasks(user_id);
create index on public.tasks(checklist_id);
