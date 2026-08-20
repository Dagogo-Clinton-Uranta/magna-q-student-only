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
