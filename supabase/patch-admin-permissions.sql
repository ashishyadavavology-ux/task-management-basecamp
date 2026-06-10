-- ============================================================================
-- Basecamp — Admin permissions (Ashish = owner)
-- Run once in Supabase SQL Editor (safe to re-run)
-- ============================================================================

-- Invited emails can sign up once, then login only
create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email text not null,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);

grant select, insert, delete on public.workspace_invites to authenticated;
alter table public.workspace_invites enable row level security;

create or replace function public.is_workspace_owner(_workspace_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspaces
    where id = _workspace_id and owner_id = _user_id
  )
$$;

create or replace function public.can_signup_with_email(check_email text)
returns boolean language sql stable security definer set search_path = public as $$
  select
    exists (
      select 1 from public.workspace_invites
      where lower(trim(email)) = lower(trim(check_email))
    )
    or (
      lower(trim(check_email)) = 'ashishyadav.avology@gmail.com'
      and not exists (
        select 1 from public.profiles
        where lower(trim(email)) = 'ashishyadav.avology@gmail.com'
      )
    );
$$;

grant execute on function public.can_signup_with_email(text) to anon, authenticated;

drop policy if exists "owner manages invites" on public.workspace_invites;
create policy "owner manages invites" on public.workspace_invites for all
  using (public.is_workspace_owner(workspace_id, auth.uid()))
  with check (public.is_workspace_owner(workspace_id, auth.uid()));

-- Signup: owner creates workspace; invited users join existing workspace
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ws_id uuid;
  invite_record record;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  select * into invite_record
  from public.workspace_invites
  where lower(trim(email)) = lower(trim(new.email))
  limit 1;

  if invite_record.id is not null then
    insert into public.user_roles (user_id, role) values (new.id, 'member')
    on conflict do nothing;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (invite_record.workspace_id, new.id, 'member')
    on conflict do nothing;

    delete from public.workspace_invites where id = invite_record.id;
    return new;
  end if;

  if lower(trim(new.email)) = 'ashishyadav.avology@gmail.com' then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;

    insert into public.workspaces (name, owner_id)
    values ('Basecamp Project Management', new.id)
    returning id into ws_id;

    insert into public.workspace_members (workspace_id, user_id, role)
    values (ws_id, new.id, 'admin')
    on conflict do nothing;

    return new;
  end if;

  insert into public.user_roles (user_id, role) values (new.id, 'member')
  on conflict do nothing;

  return new;
end;
$$;

-- Owner-only project create/delete
drop policy if exists "members write projects" on public.projects;
drop policy if exists "owner writes projects" on public.projects;
drop policy if exists "members read projects" on public.projects;

create policy "members read projects" on public.projects for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

create policy "owner writes projects" on public.projects for all
  using (public.is_workspace_owner(workspace_id, auth.uid()))
  with check (public.is_workspace_owner(workspace_id, auth.uid()));

-- Owner manages team members (insert/update/delete only)
drop policy if exists "owner manages workspace members" on public.workspace_members;
drop policy if exists "owner inserts workspace members" on public.workspace_members;
drop policy if exists "owner deletes workspace members" on public.workspace_members;

create policy "owner inserts workspace members" on public.workspace_members for insert
  with check (public.is_workspace_owner(workspace_id, auth.uid()));

create policy "owner deletes workspace members" on public.workspace_members for delete
  using (public.is_workspace_owner(workspace_id, auth.uid()));

drop policy if exists "read workspace members" on public.workspace_members;
create policy "read workspace members" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id, auth.uid()));

-- Owner assigns project members
drop policy if exists "workspace manages project members" on public.project_members;
create policy "owner manages project members" on public.project_members for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.is_workspace_owner(p.workspace_id, auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id
        and public.is_workspace_owner(p.workspace_id, auth.uid())
    )
  );

drop policy if exists "read project members" on public.project_members;
create policy "read project members" on public.project_members for select
  using (
    public.is_project_member(project_id, auth.uid())
    or exists (
      select 1 from public.projects p
      join public.workspace_members wm on wm.workspace_id = p.workspace_id
      where p.id = project_id and wm.user_id = auth.uid()
    )
  );

-- Ensure Ashish is owner on existing workspace (run if already signed up)
update public.workspaces w
set owner_id = p.id
from public.profiles p
where lower(trim(p.email)) = 'ashishyadav.avology@gmail.com'
  and w.owner_id is distinct from p.id;

update public.workspace_members wm
set role = 'admin'
from public.profiles p, public.workspaces w
where p.id = wm.user_id
  and w.id = wm.workspace_id
  and w.owner_id = p.id
  and lower(trim(p.email)) = 'ashishyadav.avology@gmail.com';

update public.user_roles ur
set role = 'admin'
from public.profiles p
where ur.user_id = p.id
  and lower(trim(p.email)) = 'ashishyadav.avology@gmail.com';
