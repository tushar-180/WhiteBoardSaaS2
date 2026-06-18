-- Add created_at column to workspace_invites table with a default value
-- and backfill existing null values with the current timestamp.

-- 1. Add the created_at column if it doesn't exist, with a default
alter table public.workspace_invites 
  add column if not exists created_at timestamptz default now();

-- 2. Backfill any existing rows where created_at is still null
update public.workspace_invites 
set created_at = now()
where created_at is null;

-- 3. Set the column as not null now that all values are populated
alter table public.workspace_invites 
  alter column created_at set not null;
