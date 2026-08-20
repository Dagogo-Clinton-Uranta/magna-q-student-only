# Snags requiring owner action

## Docker daemon access

The current user cannot access `/var/run/docker.sock`, so the complete Supabase local stack could not be started. SQL is tested in isolated PostgreSQL, but Storage and Auth integration require fixing Docker group/Desktop access and running `npx supabase start && npx supabase db reset`.

## Live authentication and email

No real Supabase credentials are available. Configure callback URLs and student test identities, then run the authenticated student Playwright flows.

## Node runtime

This machine currently uses Node 21.5 and does not yet have Node 24 installed. The application, CI, and production environments are configured for Node 24, so switch to Node 24 before running runtime-dependent verification locally.

## Dependency advisory

`npm audit` reports a transitive PostCSS advisory through the installed Next.js line and offers an unsafe downgrade. Upgrade to the first compatible patched Next.js release and rerun the complete gate.

## Legal and clinical content

Privacy, terms and disclaimer text require counsel. Demo medical content is illustrative and must be replaced with validated production content through the separate administration module.

## Full authenticated E2E suite

Public/auth-boundary Playwright tests run. Complete Auth, Storage, study and result browser tests need the live local Supabase stack above.
