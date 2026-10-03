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
Event dates and program links are optional: undated opportunities retain their
source-published timing text, while standalone or unmatched events retain their
source-provided institution, specialty, and optional ACGME labels directly on
the event record.

Program-level IMG evidence is stored in `residency_img_metrics`, with one row
per program, reporting period, metric definition and source. Do not treat
`img_resident_share` as an applicant acceptance rate: FREIDA describes its
resident/fellow characteristics as three-year averages, while program-level
applicant denominators and IMG acceptance counts are generally not public.
`scripts/research-residency-img.mts` checks every imported ACGME ID, records both
available and unavailable results in a dated research snapshot, and generates
the corresponding forward-only import migration. Re-running it resumes failed
or incomplete research from the last checkpoint.
`residency_img_research_status` records an outcome for every directory entry,
including programs whose public FREIDA page was missing or did not report the
metric, so missing data is distinguishable from research that was never run.

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

The global website banner is stored in the singleton `site_announcements` row
whose ID is `primary`. Anonymous and signed-in users can read it only while it
is enabled. An authenticated administrator from the shared admin application
can update its `message` and `enabled` fields through Supabase; RLS checks the
administrator's role in `profiles`. The service role can also manage the row
for trusted server-side workflows.

Use `EXPLAIN (ANALYZE, BUFFERS)` on `eligible_question_ids` with production-like cardinalities. It should use the question exam/status index and reverse mapping indexes. The initial sampler hashes only a bounded candidate pool; replace that strategy if production plans show unacceptable offset cost or distribution.
