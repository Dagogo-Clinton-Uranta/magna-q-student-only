# Security

- Supabase cookie sessions are revalidated with `auth.getUser()`.
- Roles live in `profiles`, not client metadata. Database triggers prevent self-promotion.
- Students cannot directly select question options or correctness.
- Tutor explanations follow an idempotent answer transaction; timed explanations require completion.
- Privileged transitions are security-definer functions with explicit role and version checks.
- Eligible counts, block generation, question serving and answer submission use separate database-backed per-user/IP throttles and private no-store responses. Denials emit structured `rate_limit_denied` events so unusually rapid traversal can be alerted on.
- Question images use a private bucket. Production delivery should use short-lived signed URLs.
- CSP, frame denial, MIME sniffing protection and restrictive browser permissions are configured.

Do not expose `SUPABASE_SERVICE_ROLE_KEY`. Rotate any credential suspected of browser or log exposure.
