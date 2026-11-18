-- Allow the service role (used by the admin dashboard) to read all submissions.
-- The service role bypasses RLS but still needs an explicit table-level GRANT
-- when the table has had a blanket REVOKE applied to it.
grant select on public.conversation_submissions to service_role;
