-- 1) 테이블
create table if not exists public.notes_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  deleted_at timestamptz
);

create index if not exists notes_messages_user_created_at_idx
  on public.notes_messages (user_id, created_at desc);

-- 2) Row Level Security
alter table public.notes_messages enable row level security;

-- SELECT: 내 것만
drop policy if exists "select_own_messages" on public.notes_messages;
create policy "select_own_messages"
on public.notes_messages
for select
using (user_id = auth.uid());

-- INSERT: 내 것으로만 (user_id는 default auth.uid()라 보통 안 넣어도 됨)
drop policy if exists "insert_own_messages" on public.notes_messages;
create policy "insert_own_messages"
on public.notes_messages
for insert
with check (user_id = auth.uid());

-- UPDATE: 내 것만
drop policy if exists "update_own_messages" on public.notes_messages;
create policy "update_own_messages"
on public.notes_messages
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- DELETE: 내 것만
drop policy if exists "delete_own_messages" on public.notes_messages;
create policy "delete_own_messages"
on public.notes_messages
for delete
using (user_id = auth.uid());
