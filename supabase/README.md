# Saving conversation answers

The site opens with a short, tap-based questionnaire. People can skip it and explore the page or book through Calendly. Submitting answers requires an email address. Consent to receive email updates is a separate, optional choice. Answers and emails are not sent to analytics. Email follow-up is manual; no email service is connected.

## Connect a Supabase project

1. Create a Supabase project.
2. Apply all migrations in order. In the Supabase SQL Editor, run `migrations/20261118200000_create_conversation_submissions.sql`, `migrations/20261118214500_add_contact_email.sql`, `migrations/20261118220000_remove_required_submission_consent.sql`, and `migrations/20261118230000_prevent_duplicate_email_submissions.sql`. The latest migration also brings older databases up to date with the current consent handling and prevents duplicate email submissions. Or, authenticate with `pnpm exec supabase login`, then run `pnpm exec supabase link --project-ref YOUR_PROJECT_REF` and `pnpm exec supabase db push`. The CLI may ask for your database password in the terminal.
3. Copy `.env.example` to `.env.local` in the project root.
4. In the Supabase project settings, copy the project URL and anon key into `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`.
5. Restart the Next.js development server.

Keep `.env.local` on your computer and out of source control. The site uses the anon key only in its server route. Row-level security lets visitors add a validated answer but does not let the public site read saved answers. Review submissions in the Supabase Table Editor while signed in to your project.

## Review answers

Run the queries in `analysis.sql` in the Supabase SQL Editor to compare audience categories, common challenges, desired outcomes, and willingness to consider paid support.

Keep submissions, including email addresses, for no longer than 12 months, then delete them in the Table Editor. The database only accepts the listed answer choices. Use email addresses for conversation follow-up. Send related updates only to people with `email_updates_consent` set to true.
