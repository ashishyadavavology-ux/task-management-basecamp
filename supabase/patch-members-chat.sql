-- ============================================================================
-- Basecamp — Member profiles + team direct messages
-- Run in Supabase SQL Editor (safe to re-run)
-- ============================================================================

alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists phone text;

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  body text not null default '',
  attachment_url text,
  attachment_name text,
  attachment_type text,
  is_pinned boolean not null default false,
  edited_at timestamptz,
  created_at timestamptz not null default now()
);

grant select, insert, update, delete on public.direct_messages to authenticated;
alter table public.direct_messages enable row level security;

drop policy if exists "workspace members read dms" on public.direct_messages;
drop policy if exists "workspace members send dms" on public.direct_messages;
drop policy if exists "sender updates dms" on public.direct_messages;
drop policy if exists "sender deletes dms" on public.direct_messages;

create policy "workspace members read dms" on public.direct_messages for select
  using (
    public.is_workspace_member(workspace_id, auth.uid())
    and (sender_id = auth.uid() or recipient_id = auth.uid())
  );

create policy "workspace members send dms" on public.direct_messages for insert
  with check (
    sender_id = auth.uid()
    and public.is_workspace_member(workspace_id, auth.uid())
    and exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = direct_messages.workspace_id
        and wm.user_id = recipient_id
    )
  );

create policy "sender updates dms" on public.direct_messages for update
  using (sender_id = auth.uid())
  with check (sender_id = auth.uid());

create policy "sender deletes dms" on public.direct_messages for delete
  using (sender_id = auth.uid());

do $$ begin
  alter publication supabase_realtime add table public.direct_messages;
exception when others then null;
end $$;

-- Sync existing Ashish profile names
update public.profiles
set
  first_name = coalesce(first_name, split_part(full_name, ' ', 1)),
  last_name = coalesce(last_name, nullif(trim(substring(full_name from position(' ' in full_name))), ''))
where full_name is not null and first_name is null;
