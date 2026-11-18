create table public.conversation_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  consented_at timestamptz not null default now(),
  category text not null check (category in ('business', 'idea', 'career', 'creator', 'mentorship', 'other')),
  biggest_challenge text not null,
  desired_outcome text not null check (desired_outcome in ('clear_next_step', 'practical_plan', 'feedback_on_idea', 'tools_or_skills', 'fresh_perspective')),
  previous_attempts text not null check (previous_attempts in ('not_yet', 'on_my_own', 'advice_or_information', 'course_tool_or_service', 'professional_help')),
  willingness text not null check (willingness in ('yes', 'maybe', 'not_now')),
  consent boolean not null check (consent),
  constraint challenge_matches_category check (
    (category = 'business' and biggest_challenge in ('steady_enquiries', 'converting_customers', 'growing_sales', 'day_to_day_work', 'using_technology', 'something_else'))
    or (category = 'idea' and biggest_challenge in ('choosing_what_to_build', 'testing_an_idea', 'shaping_an_offer', 'building_first_version', 'finding_first_customers', 'something_else'))
    or (category = 'career' and biggest_challenge in ('choosing_direction', 'learning_a_skill', 'finding_opportunities', 'changing_careers', 'building_confidence', 'something_else'))
    or (category = 'creator' and biggest_challenge in ('finding_clients', 'pricing_work', 'promoting_work', 'managing_workload', 'growing_income', 'something_else'))
    or (category = 'mentorship' and biggest_challenge in ('difficult_decision', 'choosing_next_step', 'building_confidence', 'staying_accountable', 'talking_it_through', 'something_else'))
    or (category = 'other' and biggest_challenge in ('finding_direction', 'solving_a_problem', 'building_a_skill', 'getting_unstuck', 'something_else'))
  )
);

create index conversation_submissions_created_at_idx
  on public.conversation_submissions (created_at desc);

create index conversation_submissions_category_created_at_idx
  on public.conversation_submissions (category, created_at desc);

create index conversation_submissions_challenge_idx
  on public.conversation_submissions (biggest_challenge);

alter table public.conversation_submissions enable row level security;

revoke all on public.conversation_submissions from public, anon, authenticated;
grant insert (category, biggest_challenge, desired_outcome, previous_attempts, willingness, consent)
  on public.conversation_submissions to anon;

create policy "Allow anonymous answer submissions"
  on public.conversation_submissions
  for insert
  to anon
  with check (true);
