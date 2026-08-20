# ADR 0005: Email/password authentication and onboarding

Status: accepted (2026-07-20)

Email and password authentication is the primary sign-in method. Signup may exchange a one-time email-confirmation code for an HTTP-cookie session when Supabase email confirmation is enabled; normal logins call password authentication directly. Middleware refreshes the session, while protected Server Components call `auth.getUser()` and read the database profile before rendering.

Student profile data is collected after email verification. Every browser-created profile explicitly uses the `student` role, and this portal neither assigns nor accepts staff roles. Staff identity management belongs to the separate administration module.
