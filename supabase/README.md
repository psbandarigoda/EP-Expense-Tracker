# Supabase setup

`nzo_complete_schema.sql` is the only authoritative database setup file.

Before running it, create and confirm these Supabase Auth users:

- `bgpsandaruwan@gmail.com`
- `wickycinema@gmail.com`

Then paste the complete SQL file into the Supabase SQL Editor and run it once.
The file creates the base ledger, imports the three current records, and installs
the accounting, founder, reporting, security, and audit schema in one transaction.

## Password reset

The login screen includes **Forgot password?** for the two authorized staff
accounts. It sends a Supabase recovery email, opens a new-password form after
verification, and requires matching passwords with at least 8 characters.
Supabase also enforces any stronger password policy configured for the project.

In Supabase **Authentication → URL Configuration**, set **Site URL** to the
deployed application URL and add these exact **Redirect URLs**:

- `http://localhost:3003/?reset-password=1` for local development.
- `https://YOUR-APP-DOMAIN/?reset-password=1` for production (replace the domain).

If the application is hosted under a subpath, include that path before the query
string. The app generates the redirect from the current origin and pathname.
Keep the Reset Password email template's `{{ .ConfirmationURL }}` link so
Supabase verifies the recovery token before returning to the app. Configure
Supabase email delivery for the staff addresses as needed.

Expired or invalid links offer a new reset email. A valid recovery session
remains on the password form after a refresh; successful updates show a
confirmation before continuing to the company books. No schema changes are
required.
