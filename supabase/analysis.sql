select
  category,
  biggest_challenge,
  count(*) as responses,
  count(*) filter (where willingness = 'yes') as open_to_paid_support,
  count(*) filter (where willingness = 'maybe') as depends_on_support
from public.conversation_submissions
where created_at >= now() - interval '90 days'
group by category, biggest_challenge
order by responses desc, category, biggest_challenge;

select
  desired_outcome,
  count(*) as responses
from public.conversation_submissions
where created_at >= now() - interval '90 days'
group by desired_outcome
order by responses desc, desired_outcome;

select
  previous_attempts,
  count(*) as responses
from public.conversation_submissions
where created_at >= now() - interval '90 days'
group by previous_attempts
order by responses desc, previous_attempts;

select
  category,
  biggest_challenge,
  desired_outcome,
  previous_attempts,
  willingness,
  created_at
from public.conversation_submissions
order by created_at desc;
