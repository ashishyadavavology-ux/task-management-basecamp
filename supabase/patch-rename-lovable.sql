-- ============================================================================
-- Basecamp — Rename "lovable" text to "Basecamp"
-- Run this in Supabase → SQL Editor (safe to run multiple times)
-- ============================================================================

-- Projects: "lovable project" → "Basecamp Project"
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

-- Workspaces
update public.workspaces
set name = replace(name, 'lovable', 'Basecamp')
where name ilike '%lovable%';
