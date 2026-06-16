-- Enable the pg_trgm extension if it doesn't already exist
-- This extension provides functions and operators for determining the similarity of 
-- alphanumeric text based on trigram matching, which is required for indexing ILIKE '%...%' queries.
create extension if not exists pg_trgm;

-- Create a GIN index on the email column in the profiles table
-- This index speeds up the ILIKE '%query%' searches used in the invite suggestions dropdown.
create index if not exists profiles_email_trgm_idx on public.profiles using gin (email gin_trgm_ops);
