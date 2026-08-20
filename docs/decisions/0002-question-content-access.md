# ADR 0002: Question content access

Status: accepted (2026-07-20)

Students receive one deliberately shaped question DTO at a time through authenticated server operations. Direct RLS access to `questions` and `question_options` is withheld from students because column-level policies cannot safely hide `is_correct`, explanations and internal review metadata in every state.

Tutor explanations become available only after an idempotent submission. Timed explanations become available only after block completion.
