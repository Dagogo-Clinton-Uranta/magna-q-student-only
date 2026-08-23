# Database

Apply migrations in filename order with `supabase db reset` locally or `supabase db push` against a linked project. The schema normalises exam taxonomy and fixes block membership in `test_block_questions`. Main indexes cover exam/status questions, reverse taxonomy lookups, user blocks, latest attempts, review queues and error reports.

The ordered migrations cover the shared content schema and access policies,
student block generation and playback, analytics, interview practice, billing,
registration, feedback, usernames, and community content. Staff-only authoring
and dashboard migrations live with the separate administration module.

Residency event research uses `residency_programs` as a UUID-backed projection
of the populated `residencies` directory. `residency_events` stores event facts,
`residency_event_programs` supports events spanning multiple programs, and
`residency_event_research_status` distinguishes a completed search with no event
found from a program that has not yet been checked or needs another review.

Questions can belong to one or more subjects but must belong to exactly one
system (stored in the legacy `categories` tables). The create-test filter treats
multiple history types as a union, then intersects that pool with the selected
subjects and optional systems.

`test_blocks` and `test_block_questions` persist the randomly selected fixed
test membership. `answer_logs.selected_option_id` provides aggregate
option-choice percentages. Student marks and notes remain private per-user
records, while `questions.key_phrases` and `question_options.explanation` are
shared teaching content managed outside this portal.

Do not reorder or edit an applied migration. Add a forward migration for production changes. Back up the target project before `supabase db push`, review the generated diff, then run the deployment smoke checks.

Use `EXPLAIN (ANALYZE, BUFFERS)` on `eligible_question_ids` with production-like cardinalities. It should use the question exam/status index and reverse mapping indexes. The initial sampler hashes only a bounded candidate pool; replace that strategy if production plans show unacceptable offset cost or distribution.
