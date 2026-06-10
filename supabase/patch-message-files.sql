-- ============================================================================
-- Basecamp — Chat file attachments (images + PDF)
-- Run this in Supabase → SQL Editor (safe to run multiple times)
-- ============================================================================

-- Message attachment columns -----------------------------------------------
alter table public.messages
  add column if not exists attachment_url text;

alter table public.messages
  add column if not exists attachment_name text;

alter table public.messages
  add column if not exists attachment_type text;

-- Storage bucket for chat files ---------------------------------------------
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

-- Storage policies ----------------------------------------------------------
drop policy if exists "chat files public read" on storage.objects;
drop policy if exists "chat files authenticated upload" on storage.objects;
drop policy if exists "chat files owner delete" on storage.objects;

create policy "chat files public read" on storage.objects
  for select
  using (bucket_id = 'chat-files');

create policy "chat files authenticated upload" on storage.objects
  for insert
  with check (
    bucket_id = 'chat-files'
    and auth.role() = 'authenticated'
  );

create policy "chat files owner delete" on storage.objects
  for delete
  using (
    bucket_id = 'chat-files'
    and auth.uid()::text = (storage.foldername(name))[2]
  );
