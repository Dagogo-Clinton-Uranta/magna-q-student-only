# ADR 0003: Seed questions after trusted-user bootstrap

Status: accepted (2026-07-20)

Taxonomy is seeded in Phase 1. Demo questions are deferred to the validated Phase 3 import workflow because every question must have a real `created_by` profile and the clean local database has no application user yet. This preserves referential integrity rather than inventing an auth identity in SQL seed data.
