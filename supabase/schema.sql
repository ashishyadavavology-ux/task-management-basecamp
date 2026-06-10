-- ============================================================================
-- Hearth — full Supabase schema (safe to re-run; skips objects that exist)
-- Fresh project: run this entire file.
-- Tables already exist: run patch.sql instead.
-- ============================================================================

-- Enums --------------------------------------------------------------------
do $$ begin create type public.app_role as enum ('admin', 'manager', 'member');
exception when duplicate_object then null; end $$;

do $$ begin create type public.project_status as enum ('planning', 'active', 'on_hold', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin create type public.priority as enum ('low', 'medium', 'high', 'urgent');
exception when duplicate_object then null; end $$;

do $$ begin create type public.task_status as enum ('todo', 'in_progress', 'review', 'done');
exception when duplicate_object then null; end $$;

-- Profiles -----------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  title text,
  avatar_color text default 'oklch(0.58 0.17 252)',
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'member',
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- Workspaces ---------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan text default 'Starter',
  created_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'member',
  unique (workspace_id, user_id)
);

create or replace function public.is_workspace_member(_workspace_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.workspace_members where workspace_id = _workspace_id and user_id = _user_id)
$$;

-- Projects -----------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text default '',
  status project_status not null default 'planning',
  priority priority not null default 'medium',
  color text default 'oklch(0.58 0.17 252)',
  due_date date,
  progress int not null default 0,
  tags text[] default '{}',
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  unique (project_id, user_id)
);

create or replace function public.is_project_member(_project_id uuid, _user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.project_members where project_id = _project_id and user_id = _user_id)
$$;

-- Tasks --------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  status task_status not null default 'todo',
  priority priority not null default 'medium',
  assignee_id uuid references auth.users(id) on delete set null,
  due_date date,
  tags text[] default '{}',
  position int not null default 0,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  done boolean not null default false
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid references auth.users(id),
  file_name text not null,
  storage_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_pinned boolean not null default false,
  edited_at timestamptz,
  attachment_url text,
  attachment_name text,
  attachment_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Signup trigger -----------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  ws_id uuid;
  ws_name text;
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;

  insert into public.user_roles (user_id, role) values (new.id, 'member')
  on conflict do nothing;

  ws_name := coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), 'My') || '''s Workspace';

  insert into public.workspaces (name, owner_id) values (ws_name, new.id)
  returning id into ws_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (ws_id, new.id, 'admin')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Grants -------------------------------------------------------------------
grant select on public.profiles to anon;
grant select, insert, update, delete on public.profiles to authenticated;
grant select, insert, update, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.workspaces to authenticated;
grant select, insert, update, delete on public.workspace_members to authenticated;
grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_members to authenticated;
grant select, insert, update, delete on public.tasks to authenticated;
grant select, insert, update, delete on public.subtasks to authenticated;
grant select, insert, update, delete on public.comments to authenticated;
grant select, insert, update, delete on public.attachments to authenticated;
grant select, insert, update, delete on public.messages to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.notifications to authenticated;
grant all on all tables in schema public to service_role;

-- RLS ----------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.comments enable row level security;
alter table public.attachments enable row level security;
alter table public.messages enable row level security;
alter table public.activities enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "profiles readable" on public.profiles;
drop policy if exists "update own profile" on public.profiles;
create policy "profiles readable" on public.profiles for select using (true);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "read own roles" on public.user_roles;
create policy "read own roles" on public.user_roles for select using (auth.uid() = user_id);

drop policy if exists "members read workspaces" on public.workspaces;
drop policy if exists "create workspaces" on public.workspaces;
drop policy if exists "owner manages workspace" on public.workspaces;
create policy "members read workspaces" on public.workspaces for select
  using (public.is_workspace_member(id, auth.uid()) or owner_id = auth.uid());
create policy "create workspaces" on public.workspaces for insert with check (owner_id = auth.uid());
create policy "owner manages workspace" on public.workspaces for update using (owner_id = auth.uid());

drop policy if exists "read workspace members" on public.workspace_members;
drop policy if exists "admins manage members" on public.workspace_members;
drop policy if exists "owner manages workspace members" on public.workspace_members;
create policy "read workspace members" on public.workspace_members for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "owner manages workspace members" on public.workspace_members for all
  using (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()))
  with check (exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = auth.uid()));

drop policy if exists "members read projects" on public.projects;
drop policy if exists "members write projects" on public.projects;
create policy "members read projects" on public.projects for select
  using (public.is_workspace_member(workspace_id, auth.uid()));
create policy "members write projects" on public.projects for all
  using (public.is_workspace_member(workspace_id, auth.uid()))
  with check (public.is_workspace_member(workspace_id, auth.uid()));

drop policy if exists "read project members" on public.project_members;
drop policy if exists "manage project members" on public.project_members;
drop policy if exists "workspace manages project members" on public.project_members;
create policy "read project members" on public.project_members for select
  using (public.is_project_member(project_id, auth.uid())
    or exists (select 1 from public.projects p join public.workspace_members wm on wm.workspace_id = p.workspace_id
               where p.id = project_id and wm.user_id = auth.uid()));
create policy "workspace manages project members" on public.project_members for all
  using (exists (select 1 from public.projects p join public.workspace_members wm on wm.workspace_id = p.workspace_id
                 where p.id = project_id and wm.user_id = auth.uid()))
  with check (exists (select 1 from public.projects p join public.workspace_members wm on wm.workspace_id = p.workspace_id
                      where p.id = project_id and wm.user_id = auth.uid()));

drop policy if exists "members access tasks" on public.tasks;
create policy "members access tasks" on public.tasks for all
  using (public.is_project_member(project_id, auth.uid()))
  with check (public.is_project_member(project_id, auth.uid()));

drop policy if exists "members access subtasks" on public.subtasks;
create policy "members access subtasks" on public.subtasks for all
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id, auth.uid())));

drop policy if exists "members access comments" on public.comments;
create policy "members access comments" on public.comments for all
  using (exists (select 1 from public.tasks t where t.id = task_id and public.is_project_member(t.project_id, auth.uid())))
  with check (user_id = auth.uid());

drop policy if exists "members access attachments" on public.attachments;
create policy "members access attachments" on public.attachments for all
  using (project_id is null or public.is_project_member(project_id, auth.uid()));

drop policy if exists "members access messages" on public.messages;
drop policy if exists "members send messages" on public.messages;
drop policy if exists "members update messages" on public.messages;
drop policy if exists "members delete messages" on public.messages;
create policy "members access messages" on public.messages for select
  using (public.is_project_member(project_id, auth.uid()));
create policy "members send messages" on public.messages for insert
  with check (user_id = auth.uid() and public.is_project_member(project_id, auth.uid()));
create policy "members update messages" on public.messages for update
  using (public.is_project_member(project_id, auth.uid()))
  with check (public.is_project_member(project_id, auth.uid()));
create policy "members delete messages" on public.messages for delete
  using (user_id = auth.uid() and public.is_project_member(project_id, auth.uid()));

drop policy if exists "members read activities" on public.activities;
drop policy if exists "log activities" on public.activities;
create policy "members read activities" on public.activities for select
  using (project_id is null or public.is_project_member(project_id, auth.uid()));
create policy "log activities" on public.activities for insert with check (user_id = auth.uid());

drop policy if exists "read own notifications" on public.notifications;
drop policy if exists "update own notifications" on public.notifications;
create policy "read own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Realtime -----------------------------------------------------------------
do $$ begin alter publication supabase_realtime add table public.tasks; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.messages; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.activities; exception when others then null; end $$;
do $$ begin alter publication supabase_realtime add table public.notifications; exception when others then null; end $$;
