# ADR 0001: Modular monolith

Status: accepted (2026-07-20)

Use a single Next.js App Router deployment backed by Supabase Auth, PostgreSQL and Storage. Organise code by product domain while keeping one deployable application. This is sufficient for roughly 10,000 registered users and avoids premature distributed-system overhead.

PostgreSQL RLS is the principal boundary. Browser clients use only the anon key. Privileged mutations are narrow server operations, with the service-role key reserved for trusted provider callbacks and server workflows where RLS cannot express the operation safely.
