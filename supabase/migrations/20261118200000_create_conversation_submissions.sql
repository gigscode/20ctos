create table public.conversation_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  consented_at timestamptz not null default now(),
  category text not null check (category in ('business', 'idea', 'career', 'creator', 'mentorship', 'other')),
  biggest_challenge text not null check (char_length(btrim(biggest_challenge)) between 1 and 2000),
  desired_outcome text not null check (char_length(btrim(desired_outcome)) between 1 and 2000),
  previous_attempts text check (previous_attempts is null or char_length(btrim(previous_attempts)) <= 2000),
  willingness text check (willingness is null or willingness in ('Yes', 'Maybe, depending on the solution', 'Not at the moment'))
);

create index conversation_submissions_created_at_idx
  on public.conversation_submissions (created_at desc);

create index conversation_submissions_category_created_at_idx
  on public.conversation_submissions (category, created_at desc);

alter table public.conversation_submissions enable row level security;

revoke all on public.conversation_submissions from public, anon, authenticated;
grant insert (category, biggest_challenge, desired_outcome, previous_attempts, willingness)
  on public.conversation_submissions to anon;

create policy "Allow anonymous answer submissions"
  on public.conversation_submissions
  for insert
  to anon
  with check (true);
