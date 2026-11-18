alter table public.conversation_submissions
  drop constraint if exists conversation_submissions_consent_check,
  alter column consent set default false,
  alter column consented_at drop not null,
  alter column consented_at drop default;

comment on column public.conversation_submissions.consent
  is 'Legacy storage-consent flag. False for submissions made without explicit consent.';

comment on column public.conversation_submissions.consented_at
  is 'Timestamp of explicit consent, when collected. Null when no consent was collected.';

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
