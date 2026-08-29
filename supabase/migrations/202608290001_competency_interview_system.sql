begin;

create table public.interview_rubrics (
  id uuid primary key default extensions.gen_random_uuid(),
  rubric_key text not null,
  version text not null,
  question_id text,
  status text not null default 'draft' check (status in ('draft','active','retired')),
  criteria jsonb not null default '[]'::jsonb check (jsonb_typeof(criteria) = 'array'),
  critical_elements jsonb not null default '[]'::jsonb check (jsonb_typeof(critical_elements) = 'array'),
  red_flags jsonb not null default '[]'::jsonb check (jsonb_typeof(red_flags) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(rubric_key, version)
);

create table public.interview_mock_sessions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  specialty text not null check (specialty in (
    'general','internal-medicine','surgery','pediatrics','psychiatry',
    'emergency-medicine','family-medicine','anesthesiology','radiology','dermatology'
  )),
  status text not null default 'in_progress' check (
    status in ('in_progress','awaiting_evaluation','completed','abandoned')
  ),
  selected_question_ids text[] not null check (cardinality(selected_question_ids) = 8),
  current_question_index integer not null default 0 check (current_question_index between 0 and 8),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  completed_at timestamptz,
  practice_assessment numeric(4,3) check (practice_assessment between 1 and 5),
  assessment_label text,
  strongest_competencies jsonb not null default '[]'::jsonb check (jsonb_typeof(strongest_competencies) = 'array'),
  priority_development_competencies jsonb not null default '[]'::jsonb check (jsonb_typeof(priority_development_competencies) = 'array'),
  rubric_versions jsonb not null default '[]'::jsonb check (jsonb_typeof(rubric_versions) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'completed') = (completed_at is not null))
);
create index interview_mock_sessions_user_history_idx
on public.interview_mock_sessions(user_id, status, completed_at desc, id desc);

create table public.interview_individual_results (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  practice_area text not null,
  question_type text not null check (question_type in ('general','behavioral','situational')),
  specialty text not null,
  status text not null default 'in_progress' check (
    status in ('in_progress','awaiting_evaluation','completed','failed')
  ),
  rubric_id uuid references public.interview_rubrics(id) on delete restrict,
  rubric_key text,
  rubric_version text,
  practice_assessment numeric(4,3) check (practice_assessment between 1 and 5),
  assessment_label text,
  strongest_competency text,
  priority_development_competency text,
  recommended_question_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  check ((status = 'completed') = (completed_at is not null))
);
create index interview_individual_results_user_history_idx
on public.interview_individual_results(user_id, status, completed_at desc, id desc);

create table public.interview_question_evaluations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mock_session_id uuid references public.interview_mock_sessions(id) on delete cascade,
  individual_result_id uuid references public.interview_individual_results(id) on delete cascade,
  question_id text not null,
  question_text text not null,
  question_type text not null check (question_type in ('general','behavioral','situational')),
  practice_area text not null,
  competencies text[] not null,
  mock_position integer check (mock_position between 0 and 7),
  transcript text,
  rubric_id uuid references public.interview_rubrics(id) on delete restrict,
  rubric_key text,
  rubric_version text,
  scored_criteria jsonb not null default '[]'::jsonb check (jsonb_typeof(scored_criteria) = 'array'),
  competency_scores jsonb not null default '[]'::jsonb check (jsonb_typeof(competency_scores) = 'array'),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  strengths jsonb not null default '[]'::jsonb check (jsonb_typeof(strengths) = 'array'),
  improvements jsonb not null default '[]'::jsonb check (jsonb_typeof(improvements) = 'array'),
  structured_feedback jsonb not null default '{}'::jsonb check (jsonb_typeof(structured_feedback) = 'object'),
  weighted_score numeric(4,3) check (weighted_score between 1 and 5),
  created_at timestamptz not null default now(),
  check (num_nonnulls(mock_session_id, individual_result_id) = 1),
  unique(mock_session_id, mock_position),
  unique(individual_result_id)
);
create index interview_question_evaluations_owner_idx
on public.interview_question_evaluations(user_id, created_at desc);

create table public.interview_competency_aggregates (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mock_session_id uuid references public.interview_mock_sessions(id) on delete cascade,
  individual_result_id uuid references public.interview_individual_results(id) on delete cascade,
  competency_id text not null,
  score numeric(4,3) not null check (score between 1 and 5),
  questions_assessed integer not null check (questions_assessed > 0),
  created_at timestamptz not null default now(),
  check (num_nonnulls(mock_session_id, individual_result_id) = 1),
  unique(mock_session_id, competency_id),
  unique(individual_result_id, competency_id)
);

create table public.interview_result_recommendations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  mock_session_id uuid references public.interview_mock_sessions(id) on delete cascade,
  individual_result_id uuid references public.interview_individual_results(id) on delete cascade,
  question_id text not null,
  rank integer not null check (rank > 0),
  reason_competency_id text not null,
  created_at timestamptz not null default now(),
  check (num_nonnulls(mock_session_id, individual_result_id) = 1),
  unique(mock_session_id, question_id),
  unique(individual_result_id, question_id)
);

alter table public.interview_videos
  add column question_id text,
  add column mock_session_id uuid references public.interview_mock_sessions(id) on delete set null,
  add column mock_position integer check (mock_position between 0 and 7),
  add column individual_result_id uuid references public.interview_individual_results(id) on delete set null;
alter table public.interview_videos
  add constraint interview_videos_mock_context_check check (
    (mock_session_id is null and mock_position is null)
    or (mock_session_id is not null and mock_position is not null and question_id is not null)
  );
create index interview_videos_mock_session_idx
on public.interview_videos(mock_session_id, mock_position);

create trigger interview_rubrics_updated before update on public.interview_rubrics
for each row execute function public.set_updated_at();
create trigger interview_mock_sessions_updated before update on public.interview_mock_sessions
for each row execute function public.set_updated_at();

create or replace function public.retain_latest_interview_results()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'interview_mock_sessions' and new.status = 'completed' then
    delete from public.interview_mock_sessions
    where id in (
      select id from public.interview_mock_sessions
      where user_id = new.user_id and status = 'completed'
      order by completed_at desc, id desc
      offset 5
    );
  elsif tg_table_name = 'interview_individual_results' and new.status = 'completed' then
    delete from public.interview_individual_results
    where id in (
      select id from public.interview_individual_results
      where user_id = new.user_id and status = 'completed'
      order by completed_at desc, id desc
      offset 5
    );
  end if;
  return new;
end $$;

create trigger retain_mock_interview_results
after insert or update of status, completed_at on public.interview_mock_sessions
for each row execute function public.retain_latest_interview_results();
create trigger retain_individual_interview_results
after insert or update of status, completed_at on public.interview_individual_results
for each row execute function public.retain_latest_interview_results();

create function public.complete_interview_video_submission(
  target_video_id uuid,
  target_user_id uuid,
  target_status text,
  target_s3_url text,
  target_feedback jsonb
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
  video public.interview_videos;
begin
  if target_status not in ('queued', 'completed') then
    raise exception 'invalid interview video completion status' using errcode = '22023';
  end if;
  select * into video
  from public.interview_videos
  where id = target_video_id and user_id = target_user_id and status = 'uploading'
  for update;
  if not found then
    return false;
  end if;

  update public.interview_videos set
    status = target_status,
    s3_url = target_s3_url,
    multipart_upload_id = null,
    ai_feedback = case when target_status = 'completed' then target_feedback else null end,
    completed_at = case when target_status = 'completed' then now() else null end
  where id = video.id;

  if video.mock_session_id is not null then
    update public.interview_mock_sessions set
      current_question_index = video.mock_position + 1,
      status = case when video.mock_position = 7 then 'awaiting_evaluation' else status end,
      submitted_at = case when video.mock_position = 7 then now() else submitted_at end
    where id = video.mock_session_id
      and user_id = target_user_id
      and status = 'in_progress'
      and current_question_index = video.mock_position;
    if not found then
      raise exception 'mock interview progress is no longer current' using errcode = '40001';
    end if;
  end if;
  return true;
end $$;
revoke all on function public.complete_interview_video_submission(uuid,uuid,text,text,jsonb) from public, authenticated;
grant execute on function public.complete_interview_video_submission(uuid,uuid,text,text,jsonb) to service_role;

alter table public.interview_rubrics enable row level security;
alter table public.interview_mock_sessions enable row level security;
alter table public.interview_individual_results enable row level security;
alter table public.interview_question_evaluations enable row level security;
alter table public.interview_competency_aggregates enable row level security;
alter table public.interview_result_recommendations enable row level security;

create policy interview_rubrics_student_read on public.interview_rubrics
for select to authenticated using (status = 'active' or public.current_user_role() = 'admin');
create policy interview_mock_sessions_owner_read on public.interview_mock_sessions
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_individual_results_owner_read on public.interview_individual_results
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_question_evaluations_owner_read on public.interview_question_evaluations
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_competency_aggregates_owner_read on public.interview_competency_aggregates
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_result_recommendations_owner_read on public.interview_result_recommendations
for select to authenticated using (user_id = auth.uid() or public.current_user_role() = 'admin');

grant select on public.interview_rubrics to authenticated;
grant select on public.interview_mock_sessions to authenticated;
grant select on public.interview_individual_results to authenticated;
grant select on public.interview_question_evaluations to authenticated;
grant select on public.interview_competency_aggregates to authenticated;
grant select on public.interview_result_recommendations to authenticated;

comment on table public.interview_rubrics is
'Versioned rubric container. Detailed medical anchors and weights intentionally remain draft until supplied.';
comment on column public.interview_question_evaluations.rubric_version is
'Immutable snapshot reference used to prevent historical results changing after rubric updates.';
comment on column public.interview_videos.mock_session_id is
'Videos are not deleted by result-retention triggers because S3 object cleanup must be coordinated separately.';

commit;
