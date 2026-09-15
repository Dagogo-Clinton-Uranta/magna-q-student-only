# Student authentication

Users register and sign in with an email address and password. Email
confirmation is disabled in `supabase/config.toml`, so successful registration
creates a session immediately and continues to onboarding. Password login checks
the credentials against Supabase Auth and does not use magic links.

## Redirect URLs

The app reads its verification-link origin from `NEXT_PUBLIC_APP_URL`. Next.js sets it to `http://localhost:3000` through `.env.development` and to `https://medi-nexus-africa.vercel.app` through `.env.production`.

Configure the hosted Supabase project Site URL as `https://medi-nexus-africa.vercel.app`. Add these allowed redirect URLs:

- `http://localhost:3000/auth/callback`
- `https://medi-nexus-africa.vercel.app/auth/callback`

The signup confirmation email template must use Supabase's confirmation URL so the callback receives a PKCE `code`.

Only student registration and sign-in are exposed here. Staff identity and role
management belong to the separate administration module. Client-supplied Auth
metadata is never trusted for roles, and every profile created by this portal
is explicitly stored with the `student` role.

## Bot protection

Student registration and password sign-in support Cloudflare Turnstile through
Supabase Auth. The widget is shown when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set,
and its short-lived token is passed to Supabase on every sign-up and sign-in.

To enable enforcement in production:

1. Create a free Turnstile widget in Cloudflare and allow the production
   hostname. Add `localhost` if the real widget will also be used locally.
2. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` to the widget's public site key in the
   web deployment.
3. In the Supabase Dashboard, open **Authentication > Bot and Abuse
   Protection**, enable CAPTCHA protection, select **Cloudflare Turnstile**, and
   enter the widget's secret key.

The secret belongs only in Supabase, not in this repository or in a
`NEXT_PUBLIC_` environment variable. Keep the existing signup IP limit enabled:
Turnstile filters automated submissions, while the IP limit enforces the
product's two-accounts-per-network policy.
