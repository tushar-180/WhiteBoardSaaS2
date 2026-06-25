-- Create workspace_activities table
CREATE TABLE IF NOT EXISTS public.workspace_activities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    workspace_id uuid NOT NULL,
    actor_id uuid NOT NULL,
    action_type text NOT NULL,
    entity_type text NOT NULL,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT workspace_activities_pkey PRIMARY KEY (id),
    CONSTRAINT workspace_activities_workspace_id_fkey FOREIGN KEY (workspace_id)
        REFERENCES public.workspaces (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE,
    CONSTRAINT workspace_activities_actor_id_fkey FOREIGN KEY (actor_id)
        REFERENCES public.profiles (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS workspace_activities_workspace_id_idx ON public.workspace_activities USING btree (workspace_id);
CREATE INDEX IF NOT EXISTS workspace_activities_created_at_idx ON public.workspace_activities USING btree (created_at DESC);

-- Do NOT enable RLS as per user request (or if we enable it, don't add policies. Actually, if RLS is disabled, anyone with DB access can read/write, which is fine since the API/services handle it).
-- We will just leave it disabled for now.
-- ALTER TABLE public.workspace_activities ENABLE ROW LEVEL SECURITY;

-- Set REPLICA IDENTITY FULL for Realtime to receive full row data (including old records, though it's insert-only)
ALTER TABLE public.workspace_activities REPLICA IDENTITY FULL;

-- Add the table to the realtime publication
-- Usually, we would do:
-- begin;
--   drop publication if exists supabase_realtime;
--   create publication supabase_realtime;
-- commit;
-- But standard practice in Supabase migrations to add to realtime is:
ALTER PUBLICATION supabase_realtime ADD TABLE public.workspace_activities;
