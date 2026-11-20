create or replace function public.keepalive()
returns boolean
language sql
volatile
as $$
  select true;
$$;

revoke all on function public.keepalive() from public, anon, authenticated;
grant execute on function public.keepalive() to anon;
