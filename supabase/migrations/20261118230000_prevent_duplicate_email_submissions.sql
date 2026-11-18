alter table public.conversation_submissions
  drop constraint if exists conversation_submissions_consent_check,
  alter column consent set default false,
  alter column consented_at drop not null,
  alter column consented_at drop default;

revoke insert (consent)
  on public.conversation_submissions from anon;

grant insert (
  category,
  email,
  biggest_challenge,
  desired_outcome,
  previous_attempts,
  willingness,
  email_updates_consent
)
  on public.conversation_submissions to anon;

create unique index if not exists conversation_submissions_email_unique_idx
  on public.conversation_submissions (lower(btrim(email)))
  where email is not null;
