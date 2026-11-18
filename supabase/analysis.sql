select
  category,
  count(*) as submissions,
  count(*) filter (where willingness = 'Yes') as open_to_paid_support,
  count(*) filter (where willingness = 'Maybe, depending on the solution') as depends_on_solution,
  count(*) filter (where willingness = 'Not at the moment') as not_looking_for_paid_support
from public.conversation_submissions
where created_at >= now() - interval '90 days'
group by category
order by submissions desc, category;

select
  category,
  created_at,
  biggest_challenge,
  desired_outcome,
  previous_attempts,
  willingness
from public.conversation_submissions
order by created_at desc;
