alter table public.conversation_submissions
  add column if not exists email text,
  add column if not exists email_updates_consent boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.conversation_submissions'::regclass
      and conname = 'conversation_submissions_email_check'
  ) then
    alter table public.conversation_submissions
      add constraint conversation_submissions_email_check
      check (
        email is null
        or (
          char_length(email) between 3 and 254
          and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.conversation_submissions'::regclass
      and conname = 'conversation_submissions_email_required_check'
  ) then
    alter table public.conversation_submissions
      add constraint conversation_submissions_email_required_check
      check (email is not null) not valid;
  end if;
end
$$;

comment on column public.conversation_submissions.email_updates_consent
  is 'Optional consent to receive email updates related to conversations and products. Recorded with created_at.';

revoke all on public.conversation_submissions from public, anon, authenticated;
grant insert (
  category,
  email,
  biggest_challenge,
  desired_outcome,
  previous_attempts,
  willingness,
  consent,
  email_updates_consent
)
  on public.conversation_submissions to anon;
