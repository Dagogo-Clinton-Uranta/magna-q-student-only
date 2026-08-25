begin;
create table public.question_submissions (
  id uuid primary key default extensions.gen_random_uuid(),
  exam_id uuid not null references public.exams(id) on delete restrict,
  subject_id uuid not null references public.subjects(id) on delete restrict,
  category_id uuid not null references public.categories(id) on delete restrict,
  question_text text not null check (char_length(btrim(question_text)) between 10 and 12000),
  option_a text not null check (char_length(btrim(option_a)) > 0),
  option_a_explanation text not null check (char_length(btrim(option_a_explanation)) > 0),
  option_b text not null check (char_length(btrim(option_b)) > 0),
  option_b_explanation text not null check (char_length(btrim(option_b_explanation)) > 0),
  option_c text not null check (char_length(btrim(option_c)) > 0),
  option_c_explanation text not null check (char_length(btrim(option_c_explanation)) > 0),
  option_d text not null check (char_length(btrim(option_d)) > 0),
  option_d_explanation text not null check (char_length(btrim(option_d_explanation)) > 0),
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D')),
  key_info text[] not null default array[]::text[] check (cardinality(key_info) <= 50),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.rejected_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  original_submission_id uuid not null unique,
  question_snapshot jsonb not null check (jsonb_typeof(question_snapshot) = 'object'),
  submitted_by uuid not null references public.profiles(id) on delete restrict,
  rejected_by uuid not null references public.profiles(id) on delete restrict,
  rejected_at timestamptz not null default now()
);
create index question_submissions_created_idx
on public.question_submissions(created_at, id);
create index rejected_questions_reviewer_date_idx
on public.rejected_questions(rejected_by, rejected_at desc);
create trigger question_submissions_updated before update on public.question_submissions
for each row execute function public.set_updated_at();
alter table public.question_submissions enable row level security;
alter table public.rejected_questions enable row level security;
create policy question_submissions_staff_read on public.question_submissions
for select to authenticated
using (public.current_user_role() in ('reviewer', 'admin'));
create policy question_submissions_admin_insert on public.question_submissions
for insert to authenticated
with check (
  public.current_user_role() = 'admin'
  and submitted_by = auth.uid()
);
create policy rejected_questions_staff_read on public.rejected_questions
for select to authenticated
using (public.current_user_role() in ('reviewer', 'admin'));
grant select, insert on public.question_submissions to authenticated;
grant select on public.rejected_questions to authenticated;
create function public.review_question_submission(payload jsonb, decision text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  submission public.question_submissions;
  actor_id uuid := auth.uid();
  actor_role public.user_role := public.current_user_role();
  approved_question_id uuid;
  option_value jsonb;
  key_value text;
  selected_explanation text;
  rejected_id uuid;
begin
  if actor_role is null or actor_role not in ('reviewer', 'admin') then
    raise exception 'reviewer or administrator role required' using errcode = '42501';
  end if;
  if decision not in ('approve', 'reject') then
    raise exception 'invalid review decision' using errcode = '22023';
  end if;

  select * into submission
  from public.question_submissions
  where id = (payload->>'id')::uuid
  for update;
  if submission.id is null then
    raise exception 'pending question not found' using errcode = 'P0002';
  end if;
  if jsonb_typeof(payload->'keyInfo') <> 'array'
     or jsonb_array_length(payload->'keyInfo') > 50 then
    raise exception 'invalid key information' using errcode = '23514';
  end if;
  if upper(payload->>'correctOption') not in ('A','B','C','D') then
    raise exception 'invalid correct option' using errcode = '23514';
  end if;
  if length(btrim(payload->>'question')) not between 10 and 12000 then
    raise exception 'invalid question text' using errcode = '23514';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(payload->'keyInfo') item
    where length(btrim(item)) = 0
  ) then raise exception 'key information cannot be empty' using errcode = '23514'; end if;

  update public.question_submissions set
    question_text = btrim(payload->>'question'),
    option_a = btrim(payload->>'optionA'), option_a_explanation = btrim(payload->>'optionAExplanation'),
    option_b = btrim(payload->>'optionB'), option_b_explanation = btrim(payload->>'optionBExplanation'),
    option_c = btrim(payload->>'optionC'), option_c_explanation = btrim(payload->>'optionCExplanation'),
    option_d = btrim(payload->>'optionD'), option_d_explanation = btrim(payload->>'optionDExplanation'),
    correct_option = upper(payload->>'correctOption'),
    key_info = array(select btrim(value) from jsonb_array_elements_text(payload->'keyInfo') value)
  where id = submission.id
  returning * into submission;

  if decision = 'reject' then
    insert into public.rejected_questions(
      original_submission_id, question_snapshot, submitted_by, rejected_by
    ) values (
      submission.id, to_jsonb(submission), submission.submitted_by, actor_id
    ) returning id into rejected_id;
    delete from public.question_submissions where id = submission.id;
    return rejected_id;
  end if;

  foreach key_value in array submission.key_info loop
    if position(lower(key_value) in lower(submission.question_text)) = 0 then
      raise exception 'key information "%" was not found in the question', key_value using errcode = '23514';
    end if;
  end loop;
  if not exists (
    select 1 from public.subject_categories
    where subject_id = submission.subject_id and category_id = submission.category_id
  ) then raise exception 'subject and system are not compatible' using errcode = '23514'; end if;

  selected_explanation := case submission.correct_option
    when 'A' then submission.option_a_explanation
    when 'B' then submission.option_b_explanation
    when 'C' then submission.option_c_explanation
    else submission.option_d_explanation
  end;

  insert into public.questions(
    exam_id, stem, educational_objective, explanation, high_yield_summary,
    difficulty, status, key_phrases, reviewer_id, reviewed_at,
    created_by, published_by, published_at
  ) values (
    submission.exam_id, submission.question_text,
    'Apply the clinical reasoning assessed by this question.',
    selected_explanation,
    coalesce(nullif(array_to_string(submission.key_info, ', '), ''), 'Review the key clinical findings.'),
    'medium', 'live', submission.key_info, actor_id, now(),
    submission.submitted_by, actor_id, now()
  ) returning id into approved_question_id;

  for option_value in select * from jsonb_array_elements(jsonb_build_array(
    jsonb_build_object('letter','A','text',submission.option_a,'explanation',submission.option_a_explanation,'order',0),
    jsonb_build_object('letter','B','text',submission.option_b,'explanation',submission.option_b_explanation,'order',1),
    jsonb_build_object('letter','C','text',submission.option_c,'explanation',submission.option_c_explanation,'order',2),
    jsonb_build_object('letter','D','text',submission.option_d,'explanation',submission.option_d_explanation,'order',3)
  )) loop
    insert into public.question_options(
      question_id, option_text, is_correct, distractor_rationale, explanation, sort_order
    ) values (
      approved_question_id, option_value->>'text', option_value->>'letter' = submission.correct_option,
      option_value->>'explanation', option_value->>'explanation', (option_value->>'order')::integer
    );
  end loop;

  insert into public.question_subjects(question_id, subject_id, question_exam_id, subject_exam_id)
  values(approved_question_id, submission.subject_id, submission.exam_id, submission.exam_id);
  insert into public.question_categories(question_id, category_id, question_exam_id, category_exam_id)
  values(approved_question_id, submission.category_id, submission.exam_id, submission.exam_id);
  insert into public.review_events(
    question_id, actor_id, actor_role, from_status, to_status, note, snapshot_version
  ) values (
    approved_question_id, actor_id, actor_role, 'in_review', 'live',
    'Approved through the admin question intake queue.', 1
  );
  delete from public.question_submissions where id = submission.id;
  return approved_question_id;
end $$;
revoke all on function public.review_question_submission(jsonb,text) from public;
grant execute on function public.review_question_submission(jsonb,text) to authenticated;
commit;
