-- ============================================================================
-- Basecamp — Messages features patch
-- Run this in Supabase → SQL Editor (safe to run multiple times)
--
-- Adds:
--   • is_pinned  — pin important messages
--   • edited_at  — track edited messages
--   • RLS policies for update + delete
--   • Realtime on messages table
-- ============================================================================

-- New columns ---------------------------------------------------------------
alter table public.messages
  add column if not exists is_pinned boolean not null default false;

alter table public.messages
  add column if not exists edited_at timestamptz;

-- RLS policies --------------------------------------------------------------
drop policy if exists "members update messages" on public.messages;
drop policy if exists "members delete messages" on public.messages;

-- Project members can edit messages (body, pin) and delete their own
create policy "members update messages" on public.messages
  for update
  using (public.is_project_member(project_id, auth.uid()))
  with check (public.is_project_member(project_id, auth.uid()));

create policy "members delete messages" on public.messages
  for delete
  using (
    user_id = auth.uid()
    and public.is_project_member(project_id, auth.uid())
  );

-- Realtime (ignore if already added) ----------------------------------------
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when others then null;
end $$;
