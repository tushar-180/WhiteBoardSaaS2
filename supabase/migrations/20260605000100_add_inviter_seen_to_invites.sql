-- Add inviter_seen column to workspace_invites table to track inviter dismissals
alter table public.workspace_invites add column inviter_seen boolean default false;
