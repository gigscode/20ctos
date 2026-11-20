# Saving conversation answers

The site opens with a short, tap-based questionnaire. People can skip it and explore the page or book through Calendly. Submitting answers requires an email address. Consent to receive email updates is a separate, optional choice. Answers and emails are not sent to analytics. Email follow-up is manual; no email service is connected.

## Connect a Supabase project

1. Create a Supabase project.
2. Apply all migrations in order. In the Supabase SQL Editor, run the files in `migrations/` in order. Or, authenticate with `pnpm exec supabase login`, then run `pnpm exec supabase link --project-ref YOUR_PROJECT_REF` and `pnpm exec supabase db push`. The CLI may ask for your database password in the terminal.
3. Copy `.env.example` to `.env.local` in the project root.
4. In the Supabase project settings, copy the project URL and anon key into `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `.env.local`.
5. Restart the Next.js development server.

Keep `.env.local` on your computer and out of source control. The site uses the anon key only in its server route. Row-level security lets visitors add a validated answer but does not let the public site read saved answers. Review submissions in the Supabase Table Editor while signed in to your project.

## Keep a free project active

The GitHub Actions workflow in `.github/workflows/supabase-keepalive.yml` calls a small database function once a day. It does not read or change submissions. To enable it:

1. Apply all Supabase migrations, including `20261120140000_add_keepalive_function.sql`.
2. In the GitHub repository settings, add Actions secrets named `SUPABASE_URL` and `SUPABASE_ANON_KEY` using the matching values from your Supabase project.
3. In the repository's Actions tab, enable workflows if prompted. You can run **Keep Supabase active** manually to check the setup.

GitHub's scheduled runs can be delayed or disabled, so this is not a guarantee against Supabase pausing an inactive free project. Check the workflow run history occasionally.

## Review answers

Run the queries in `analysis.sql` in the Supabase SQL Editor to compare audience categories, common challenges, desired outcomes, and willingness to consider paid support.

Keep submissions, including email addresses, for no longer than 12 months, then delete them in the Table Editor. The database only accepts the listed answer choices. Use email addresses for conversation follow-up. Send related updates only to people with `email_updates_consent` set to true.
