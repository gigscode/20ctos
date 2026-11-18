# Saving conversation answers

The site opens with a short, tap-based questionnaire. People can skip it and explore the page or book through Calendly. Answers are saved only after someone agrees and submits. The form does not ask for a name or email, and answers are not sent to analytics.

## Connect a Supabase project

1. Create a Supabase project.
2. Apply the migration. You can run `migrations/20261118200000_create_conversation_submissions.sql` in the Supabase SQL Editor. Or, authenticate with `pnpm exec supabase login`, then run `pnpm exec supabase link --project-ref YOUR_PROJECT_REF` and `pnpm exec supabase db push`. The CLI may ask for your database password in the terminal.
3. Copy `.env.example` to `.env.local` in the project root.
4. In the Supabase project settings, copy the project URL and anon key into `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`.
5. Restart the Next.js development server.

Keep `.env.local` on your computer and out of source control. The site uses the anon key only in its server route. Row-level security lets visitors add a validated answer but does not let the public site read saved answers. Review submissions in the Supabase Table Editor while signed in to your project.

## Review answers

Run the queries in `analysis.sql` in the Supabase SQL Editor to compare audience categories, common challenges, desired outcomes, and willingness to consider paid support.

Keep submissions for no longer than 12 months, then delete them in the Table Editor. The database requires consent for each submission and only accepts the listed answer choices.
