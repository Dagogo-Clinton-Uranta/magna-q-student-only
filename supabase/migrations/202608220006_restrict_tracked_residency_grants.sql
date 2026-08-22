begin;

-- Supabase project defaults grant new public tables broadly. Notes are private,
-- so anonymous users receive no table privileges and authenticated users keep
-- only the four row-level operations protected by RLS.
revoke all privileges on public.tracked_residencies from anon;
revoke truncate, references, trigger
on public.tracked_residencies from authenticated;

grant select, insert, update, delete
on public.tracked_residencies to authenticated;

commit;
