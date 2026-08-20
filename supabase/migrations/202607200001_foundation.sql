begin;

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('student', 'reviewer', 'admin');
create type public.usmle_exam as enum ('step1', 'step2ck', 'step3');
create type public.review_status as enum ('draft', 'in_review', 'changes_requested', 'physician_approved', 'live', 'retired');
create type public.study_mode as enum ('tutor', 'timed');
create type public.block_status as enum ('created', 'in_progress', 'suspended', 'completed', 'abandoned');
create type public.difficulty_level as enum ('easy', 'medium', 'hard');
create type public.question_usage_filter as enum ('all', 'unused', 'used', 'incorrect', 'correct', 'marked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 120),
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  medical_school text check (medical_school is null or char_length(medical_school) <= 200),
  training_level text check (training_level is null or char_length(training_level) <= 100),
  target_exam public.usmle_exam not null,
  role public.user_role not null default 'student',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.exams (
  id uuid primary key default extensions.gen_random_uuid(), code public.usmle_exam not null unique,
  name text not null unique, description text, active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0)
);

create table public.subjects (
  id uuid primary key default extensions.gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete restrict,
  slug text not null, name text not null, description text, active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (exam_id, slug), unique (id, exam_id)
);

create table public.categories (
  id uuid primary key default extensions.gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete restrict,
  slug text not null, name text not null, description text, active boolean not null default true,
  sort_order integer not null default 0 check (sort_order >= 0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (exam_id, slug), unique (id, exam_id)
);

create table public.subject_categories (
  subject_id uuid not null references public.subjects(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  primary key (subject_id, category_id)
);

create table public.questions (
  id uuid primary key default extensions.gen_random_uuid(), exam_id uuid not null references public.exams(id) on delete restrict,
  stem text not null check (char_length(stem) between 10 and 12000), educational_objective text not null default '',
  explanation text not null default '', high_yield_summary text not null default '', us_system_context_note text,
  glossary jsonb not null default '[]'::jsonb check (jsonb_typeof(glossary) = 'array'), image_path text,
  difficulty public.difficulty_level not null, status public.review_status not null default 'draft', version integer not null default 1 check (version > 0),
  source_references jsonb not null default '[]'::jsonb check (jsonb_typeof(source_references) = 'array'), accuracy_flags jsonb not null default '[]'::jsonb,
  reviewer_id uuid references public.profiles(id) on delete set null, reviewed_at timestamptz, reviewer_credit text,
  created_by uuid references public.profiles(id) on delete set null, published_by uuid references public.profiles(id) on delete set null,
  published_at timestamptz, retired_at timestamptz, is_free_sample boolean not null default false,
  import_key text unique, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (id, exam_id)
);

create table public.question_subjects (
  question_id uuid not null, subject_id uuid not null, question_exam_id uuid not null, subject_exam_id uuid not null,
  primary key (question_id, subject_id), foreign key (question_id, question_exam_id) references public.questions(id, exam_id) on delete cascade,
  foreign key (subject_id, subject_exam_id) references public.subjects(id, exam_id) on delete restrict,
  check (question_exam_id = subject_exam_id)
);

create table public.question_categories (
  question_id uuid not null, category_id uuid not null, question_exam_id uuid not null, category_exam_id uuid not null,
  primary key (question_id, category_id), foreign key (question_id, question_exam_id) references public.questions(id, exam_id) on delete cascade,
  foreign key (category_id, category_exam_id) references public.categories(id, exam_id) on delete restrict,
  check (question_exam_id = category_exam_id)
);

create table public.question_options (
  id uuid primary key default extensions.gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade,
  option_text text not null check (char_length(btrim(option_text)) > 0), is_correct boolean not null default false,
  distractor_rationale text, sort_order integer not null check (sort_order >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (question_id, sort_order)
);
create unique index question_options_one_correct_idx on public.question_options(question_id) where is_correct;

create table public.review_events (
  id uuid primary key default extensions.gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete restrict, from_status public.review_status, to_status public.review_status not null,
  note text, snapshot_version integer not null check (snapshot_version > 0), created_at timestamptz not null default now()
);
create table public.question_review_comments (
  id uuid primary key default extensions.gen_random_uuid(), question_id uuid not null references public.questions(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete restrict, field_name text, comment text not null check (char_length(btrim(comment)) > 0),
  resolved boolean not null default false, created_at timestamptz not null default now(), resolved_at timestamptz
);

create table public.test_blocks (
  id uuid primary key default extensions.gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid not null references public.exams(id) on delete restrict, mode public.study_mode not null, status public.block_status not null default 'created',
  requested_question_count integer not null check (requested_question_count between 1 and 200), actual_question_count integer not null default 0 check (actual_question_count >= 0),
  time_limit_seconds integer check (time_limit_seconds is null or time_limit_seconds > 0), elapsed_seconds integer not null default 0 check (elapsed_seconds >= 0),
  current_position integer not null default 1 check (current_position > 0), generation_metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz, last_activity_at timestamptz, suspended_at timestamptz, completed_at timestamptz, created_at timestamptz not null default now()
);
create table public.test_block_questions (
  id uuid primary key default extensions.gen_random_uuid(), block_id uuid not null references public.test_blocks(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict, position integer not null check (position > 0), option_order jsonb not null,
  first_viewed_at timestamptz, answered_at timestamptz, time_spent_ms integer check (time_spent_ms is null or time_spent_ms >= 0),
  selected_option_id uuid references public.question_options(id) on delete restrict, is_correct boolean, marked boolean not null default false,
  answer_submission_key uuid, unique (block_id, position), unique (block_id, question_id)
);
create table public.answer_logs (
  id uuid primary key default extensions.gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  block_id uuid not null references public.test_blocks(id) on delete cascade, block_question_id uuid not null references public.test_block_questions(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete restrict, selected_option_id uuid not null references public.question_options(id) on delete restrict,
  is_correct boolean not null, time_spent_ms integer not null check (time_spent_ms >= 0), mode public.study_mode not null,
  submission_key uuid not null, answered_at timestamptz not null default now(), client_synced boolean not null default true, unique (user_id, submission_key)
);
create table public.user_question_marks (
  user_id uuid not null references public.profiles(id) on delete cascade, question_id uuid not null references public.questions(id) on delete cascade,
  marked_at timestamptz not null default now(), primary key (user_id, question_id)
);
create table public.user_question_notes (
  id uuid primary key default extensions.gen_random_uuid(), user_id uuid not null references public.profiles(id) on delete cascade,
  question_id uuid not null references public.questions(id) on delete cascade, note_text text not null check (char_length(note_text) <= 10000),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (user_id, question_id)
);
create table public.question_stats (
  question_id uuid primary key references public.questions(id) on delete cascade, attempts bigint not null default 0 check (attempts >= 0),
  correct_count bigint not null default 0 check (correct_count between 0 and attempts), pct_correct numeric(5,2) generated always as (case when attempts = 0 then null else round(correct_count * 100.0 / attempts, 2) end) stored,
  avg_time_ms numeric(12,2), last_calculated_at timestamptz
);
create table public.error_reports (
  id uuid primary key default extensions.gen_random_uuid(), question_id uuid not null references public.questions(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete cascade, report_type text not null, report_text text not null check (char_length(report_text) between 5 and 4000),
  status text not null default 'open' check (status in ('open','resolved','rejected')), admin_note text, resolved_at timestamptz, created_at timestamptz not null default now()
);
create table public.medical_library_entries (
  id uuid primary key default extensions.gen_random_uuid(), title text not null, slug text not null unique, summary text not null, content text not null,
  source_references jsonb not null default '[]'::jsonb, status public.review_status not null default 'draft',
  created_by uuid not null references public.profiles(id) on delete restrict, reviewed_by uuid references public.profiles(id) on delete restrict,
  published_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index questions_exam_status_idx on public.questions(exam_id, status);
create index questions_reviewer_status_idx on public.questions(reviewer_id, status);
create index question_subjects_subject_idx on public.question_subjects(subject_id, question_id);
create index question_categories_category_idx on public.question_categories(category_id, question_id);
create index blocks_user_status_idx on public.test_blocks(user_id, status, created_at desc);
create index block_questions_block_position_idx on public.test_block_questions(block_id, position);
create index answer_logs_user_date_idx on public.answer_logs(user_id, answered_at desc);
create index answer_logs_question_idx on public.answer_logs(question_id, answered_at desc);
create index answer_logs_latest_attempt_idx on public.answer_logs(user_id, question_id, answered_at desc);
create index marks_user_idx on public.user_question_marks(user_id, marked_at desc);
create index review_events_question_idx on public.review_events(question_id, created_at desc);
create index error_reports_status_idx on public.error_reports(status, created_at desc);

commit;
