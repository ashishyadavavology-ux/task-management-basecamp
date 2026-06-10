-- ============================================================================
-- Basecamp — NEW features only (schema.sql pehle se run ho chuka hai)
--
-- ✅ schema.sql KAL run kar diya → DOBARA mat chalao
-- ✅ Sirf YEH file ek baar chalao — naye chat features ke liye
--
-- Safe to run multiple times.
-- ============================================================================

-- ── 1. Message pin + edit ──────────────────────────────────────────────────
alter table public.messages
  add column if not exists is_pinned boolean not null default false;

alter table public.messages
  add column if not exists edited_at timestamptz;

drop policy if exists "members update messages" on public.messages;
drop policy if exists "members delete messages" on public.messages;

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

-- ── 2. Image + PDF attachments ─────────────────────────────────────────────
alter table public.messages
  add column if not exists attachment_url text;

alter table public.messages
  add column if not exists attachment_name text;

alter table public.messages
  add column if not exists attachment_type text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'chat-files',
  'chat-files',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "chat files public read" on storage.objects;
drop policy if exists "chat files authenticated upload" on storage.objects;
drop policy if exists "chat files owner delete" on storage.objects;

create policy "chat files public read" on storage.objects
  for select using (bucket_id = 'chat-files');

create policy "chat files authenticated upload" on storage.objects
  for insert with check (bucket_id = 'chat-files' and auth.role() = 'authenticated');

create policy "chat files owner delete" on storage.objects
  for delete using (
    bucket_id = 'chat-files'
    and auth.uid()::text = (storage.foldername(name))[2]
  );

-- ── 3. lovable → Basecamp rename ───────────────────────────────────────────
update public.projects
set name = 'Basecamp Project'
where lower(trim(name)) = 'lovable project';

update public.projects
set name = replace(name, 'lovable', 'Basecamp')
where name ilike '%lovable%'
  and lower(trim(name)) <> 'lovable project';

update public.projects
set description = replace(description, 'lovable', 'Basecamp')
where description ilike '%lovable%';

update public.workspaces
set name = replace(name, 'lovable', 'Basecamp')
where name ilike '%lovable%';

-- ── 4. Realtime ──────────────────────────────────────────────────────────────
do $$ begin alter publication supabase_realtime add table public.messages; exception when others then null; end $$;
