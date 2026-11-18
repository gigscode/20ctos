# Database schema

The `public` schema contains one table: `conversation_submissions`. Row-level
security (RLS) is enabled.

| Column | Type | Constraints and defaults |
| --- | --- | --- |
| `id` | `uuid` | Primary key; defaults to `gen_random_uuid()` |
| `created_at` | `timestamptz` | Defaults to `now()` |
| `consented_at` | `timestamptz` | Defaults to `now()` |
| `category` | `text` | Restricted to `business`, `idea`, `career`, `creator`, `mentorship`, or `other` |
| `biggest_challenge` | `text` | Required |
| `desired_outcome` | `text` | Restricted to predefined values |
| `previous_attempts` | `text` | Restricted to predefined values |
| `willingness` | `text` | Restricted to `yes`, `maybe`, or `not_now` |
| `consent` | `boolean` | Must be `true` |
| `email` | `text` | Nullable; validated for basic email format and length |
| `email_updates_consent` | `boolean` | Defaults to `false` |

At the time this schema was recorded, the table contained 1 row. This is a
snapshot, not a schema constraint.
