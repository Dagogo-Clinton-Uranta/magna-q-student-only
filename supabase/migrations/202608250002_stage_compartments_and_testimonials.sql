begin;

create table public.testimonials (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  user_name text not null check (char_length(btrim(user_name)) between 2 and 120),
  username text not null check (char_length(btrim(username)) between 3 and 24),
  from_stage public.student_stage not null,
  to_stage public.student_stage not null,
  comment text not null check (char_length(btrim(comment)) between 3 and 5000),
  rating numeric(2, 1) not null
    check (rating between 0.5 and 5 and rating * 2 = trunc(rating * 2)),
  found_useful boolean,
  would_recommend boolean,
  source text not null default 'stage_change'
    check (source = 'stage_change'),
  created_at timestamptz not null default now(),
  check (from_stage <> to_stage)
);

comment on table public.testimonials is
  'Optional, attributable reviews requested after a student changes journey stage.';
comment on column public.testimonials.user_name is
  'Display-name snapshot retained with the review even if the profile name later changes.';
comment on column public.testimonials.rating is
  'Satisfaction rating in half-star increments from 0.5 through 5.0.';

create index testimonials_created_at_idx
  on public.testimonials (created_at desc);
create index testimonials_user_id_idx
  on public.testimonials (user_id, created_at desc);
create index testimonials_stage_idx
  on public.testimonials (from_stage, to_stage, created_at desc);

alter table public.testimonials enable row level security;

create policy testimonials_select_own_or_admin
  on public.testimonials
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_user_role() = 'admin');

grant select on public.testimonials to authenticated;

create function public.submit_stage_testimonial(
  p_from_stage public.student_stage,
  p_to_stage public.student_stage,
  p_comment text,
  p_rating numeric,
  p_found_useful boolean,
  p_would_recommend boolean
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_record public.profiles;
  testimonial_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select *
  into profile_record
  from public.profiles
  where id = auth.uid()
    and onboarding_completed;

  if profile_record.id is null then
    raise exception 'completed profile required' using errcode = '42501';
  end if;
  if profile_record.study_stage is distinct from p_to_stage then
    raise exception 'testimonial destination must be the current stage'
      using errcode = '23514';
  end if;
  if p_from_stage = p_to_stage then
    raise exception 'testimonial requires a stage transition'
      using errcode = '23514';
  end if;

  insert into public.testimonials (
    user_id,
    user_name,
    username,
    from_stage,
    to_stage,
    comment,
    rating,
    found_useful,
    would_recommend
  ) values (
    profile_record.id,
    profile_record.full_name,
    profile_record.username,
    p_from_stage,
    p_to_stage,
    btrim(p_comment),
    p_rating,
    p_found_useful,
    p_would_recommend
  )
  returning id into testimonial_id;

  return testimonial_id;
end;
$$;

revoke all on function public.submit_stage_testimonial(
  public.student_stage,
  public.student_stage,
  text,
  numeric,
  boolean,
  boolean
) from public;
grant execute on function public.submit_stage_testimonial(
  public.student_stage,
  public.student_stage,
  text,
  numeric,
  boolean,
  boolean
) to authenticated;

create function public.student_dashboard_summary_for_exam(
  selected_exam_id uuid
) returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result jsonb;
begin
  perform public.assert_paid_student();

  if not exists (
    select 1
    from public.profiles profile
    join public.exams exam on exam.id = selected_exam_id
    where profile.id = auth.uid()
      and coalesce(profile.study_stage::text, profile.target_exam::text) = exam.code::text
  ) then
    raise exception 'exam does not match current stage' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'totalAnswered', (
      select count(*)
      from public.answer_logs answer
      join public.questions question on question.id = answer.question_id
      where answer.user_id = auth.uid()
        and question.exam_id = selected_exam_id
    ),
    'overallPctCorrect', (
      select case
        when count(*) = 0 then null
        else round(count(*) filter (where answer.is_correct) * 100.0 / count(*), 1)
      end
      from public.answer_logs answer
      join public.questions question on question.id = answer.question_id
      where answer.user_id = auth.uid()
        and question.exam_id = selected_exam_id
    ),
    'markedCount', (
      select count(*)
      from public.user_question_marks mark
      join public.questions question on question.id = mark.question_id
      where mark.user_id = auth.uid()
        and question.exam_id = selected_exam_id
    ),
    'recentBlocks', (
      select coalesce(jsonb_agg(row_to_json(block)), '[]'::jsonb)
      from (
        select id, mode, status, actual_question_count, created_at, completed_at
        from public.test_blocks
        where user_id = auth.uid()
          and exam_id = selected_exam_id
        order by created_at desc
        limit 10
      ) block
    ),
    'subjects', (
      select coalesce(jsonb_agg(row_to_json(performance)), '[]'::jsonb)
      from (
        select subject.name,
          count(*) as attempts,
          count(*) filter (where answer.is_correct) as correct
        from public.answer_logs answer
        join public.questions question on question.id = answer.question_id
        join public.question_subjects mapping on mapping.question_id = answer.question_id
        join public.subjects subject on subject.id = mapping.subject_id
        where answer.user_id = auth.uid()
          and question.exam_id = selected_exam_id
        group by subject.id, subject.name
        order by count(*) desc
      ) performance
    ),
    'categories', (
      select coalesce(jsonb_agg(row_to_json(performance)), '[]'::jsonb)
      from (
        select category.name,
          count(*) as attempts,
          count(*) filter (where answer.is_correct) as correct
        from public.answer_logs answer
        join public.questions question on question.id = answer.question_id
        join public.question_categories mapping on mapping.question_id = answer.question_id
        join public.categories category on category.id = mapping.category_id
        where answer.user_id = auth.uid()
          and question.exam_id = selected_exam_id
        group by category.id, category.name
        order by count(*) desc
      ) performance
    )
  ) into result;

  return result;
end;
$$;

revoke all on function public.student_dashboard_summary_for_exam(uuid) from public;
grant execute on function public.student_dashboard_summary_for_exam(uuid)
  to authenticated;

commit;
