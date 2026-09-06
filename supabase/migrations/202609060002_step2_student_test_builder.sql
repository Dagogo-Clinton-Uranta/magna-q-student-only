begin;

-- Step 2 CK uses independent blueprint axes. Do not retrofit these filters onto
-- the legacy subject -> system builder used by Step 1 and Step 3.
create index if not exists step2_details_topic_idx
on public.step2_question_details(system_category_id, topic);

create function public.student_step2_test_builder_map(selected_exam_id uuid)
returns jsonb
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
      and exam.code = 'step2ck'
      and coalesce(profile.study_stage::text, profile.target_exam::text) = exam.code::text
  ) then
    raise exception 'Step 2 CK does not match current stage' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'systems', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', category.id,
        'code', catalog.code,
        'name', catalog.blueprint_name,
        'count', (
          select count(*)
          from public.step2_question_details detail
          join public.questions question on question.id = detail.question_id
          where detail.system_category_id = category.id
            and question.exam_id = selected_exam_id
            and question.question_storage_version = 3
            and question.status = 'live'
        )
      ) order by category.sort_order)
      from public.categories category
      join public.step2_system_catalog catalog on catalog.category_id = category.id
      where category.exam_id = selected_exam_id and category.active
    ), '[]'::jsonb),
    'clinicalSciences', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', subject.id,
        'code', catalog.code,
        'name', catalog.blueprint_name,
        'count', (
          select count(distinct mapping.question_id)
          from public.question_subjects mapping
          join public.questions question on question.id = mapping.question_id
          where mapping.subject_id = subject.id
            and question.exam_id = selected_exam_id
            and question.question_storage_version = 3
            and question.status = 'live'
        )
      ) order by subject.sort_order)
      from public.subjects subject
      join public.step2_discipline_catalog catalog on catalog.subject_id = subject.id
      where subject.exam_id = selected_exam_id
        and subject.active
        and catalog.primary_allowed
    ), '[]'::jsonb),
    'competencies', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', competency.id,
        'code', competency.code,
        'name', competency.name,
        'count', (
          select count(*)
          from public.step2_question_details detail
          join public.questions question on question.id = detail.question_id
          where detail.competency_id = competency.id
            and question.exam_id = selected_exam_id
            and question.question_storage_version = 3
            and question.status = 'live'
        )
      ) order by competency.sort_order)
      from public.step2_competencies competency
    ), '[]'::jsonb),
    'topics', coalesce((
      select jsonb_agg(jsonb_build_object(
        'key', topic.system_category_id::text || ':' || topic.topic,
        'name', topic.topic,
        'systemId', topic.system_category_id,
        'count', topic.question_count
      ) order by topic.system_sort_order, topic.topic)
      from (
        select detail.topic, detail.system_category_id,
          category.sort_order as system_sort_order, count(*) as question_count
        from public.step2_question_details detail
        join public.questions question on question.id = detail.question_id
        join public.categories category on category.id = detail.system_category_id
        where question.exam_id = selected_exam_id
          and question.question_storage_version = 3
          and question.status = 'live'
        group by detail.topic, detail.system_category_id, category.sort_order
      ) topic
    ), '[]'::jsonb),
    'nutritionCount', (
      select count(*)
      from public.step2_question_details detail
      join public.questions question on question.id = detail.question_id
      where detail.nutrition_tagged
        and question.exam_id = selected_exam_id
        and question.question_storage_version = 3
        and question.status = 'live'
    )
  ) into result;

  return result;
end;
$$;

create function public.eligible_step2_question_ids(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_system_ids uuid[],
  selected_clinical_science_ids uuid[] default array[]::uuid[],
  selected_competency_ids uuid[] default array[]::uuid[],
  selected_topics text[] default array[]::text[],
  selected_difficulties public.difficulty_level[] default array[]::public.difficulty_level[],
  nutrition_filter text default 'all'
) returns table(question_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select question.id
  from public.questions question
  join public.step2_question_details detail on detail.question_id = question.id
  where question.exam_id = selected_exam_id
    and question.question_storage_version = 3
    and question.status = 'live'
    and detail.system_category_id = any(selected_system_ids)
    and (
      cardinality(selected_clinical_science_ids) = 0
      or exists (
        select 1
        from public.question_subjects mapping
        where mapping.question_id = question.id
          and mapping.subject_id = any(selected_clinical_science_ids)
      )
    )
    and (
      cardinality(selected_competency_ids) = 0
      or detail.competency_id = any(selected_competency_ids)
    )
    and (
      cardinality(selected_topics) = 0
      or detail.system_category_id::text || ':' || detail.topic = any(selected_topics)
    )
    and (
      cardinality(selected_difficulties) = 0
      or question.difficulty = any(selected_difficulties)
    )
    and case nutrition_filter
      when 'only' then detail.nutrition_tagged
      when 'exclude' then not detail.nutrition_tagged
      else true
    end
    and (
      ('unused' = any(usage_modes) and not exists (
        select 1 from public.answer_logs answer
        where answer.user_id = auth.uid() and answer.question_id = question.id
      ))
      or ('incorrect' = any(usage_modes) and false = (
        select answer.is_correct
        from public.answer_logs answer
        where answer.user_id = auth.uid() and answer.question_id = question.id
        order by answer.answered_at desc, answer.id desc
        limit 1
      ))
      or ('correct' = any(usage_modes) and true = (
        select answer.is_correct
        from public.answer_logs answer
        where answer.user_id = auth.uid() and answer.question_id = question.id
        order by answer.answered_at desc, answer.id desc
        limit 1
      ))
      or ('marked' = any(usage_modes) and exists (
        select 1 from public.user_question_marks mark
        where mark.user_id = auth.uid() and mark.question_id = question.id
      ))
    );
$$;

create function public.student_step2_eligible_question_count(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_system_ids uuid[],
  selected_clinical_science_ids uuid[] default array[]::uuid[],
  selected_competency_ids uuid[] default array[]::uuid[],
  selected_topics text[] default array[]::text[],
  selected_difficulties public.difficulty_level[] default array[]::public.difficulty_level[],
  nutrition_filter text default 'all'
) returns bigint
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  result bigint;
begin
  perform public.assert_paid_student();

  if not exists (
    select 1
    from public.profiles profile
    join public.exams exam on exam.id = selected_exam_id
    where profile.id = auth.uid()
      and exam.code = 'step2ck'
      and coalesce(profile.study_stage::text, profile.target_exam::text) = exam.code::text
  ) then
    raise exception 'Step 2 CK does not match current stage' using errcode = '42501';
  end if;
  if coalesce(cardinality(usage_modes), 0) not between 1 and 4
     or usage_modes && array['all','used']::public.question_usage_filter[] then
    raise exception 'select one or more supported question types' using errcode = '22023';
  end if;
  if coalesce(cardinality(selected_system_ids), 0) not between 1 and 14 then
    raise exception 'select one or more Step 2 CK systems' using errcode = '22023';
  end if;
  if nutrition_filter not in ('all', 'only', 'exclude') then
    raise exception 'invalid nutrition filter' using errcode = '22023';
  end if;
  if exists (
    select 1 from unnest(selected_system_ids) chosen(id)
    left join public.step2_system_catalog catalog on catalog.category_id = chosen.id
    left join public.categories category on category.id = chosen.id
      and category.exam_id = selected_exam_id and category.active
    where catalog.category_id is null or category.id is null
  ) or exists (
    select 1 from unnest(selected_clinical_science_ids) chosen(id)
    left join public.step2_discipline_catalog catalog on catalog.subject_id = chosen.id
      and catalog.primary_allowed
    left join public.subjects subject on subject.id = chosen.id
      and subject.exam_id = selected_exam_id and subject.active
    where catalog.subject_id is null or subject.id is null
  ) or exists (
    select 1 from unnest(selected_competency_ids) chosen(id)
    left join public.step2_competencies competency on competency.id = chosen.id
    where competency.id is null
  ) then
    raise exception 'Step 2 CK taxonomy selection is invalid' using errcode = '23514';
  end if;
  if exists (
    select 1
    from unnest(selected_topics) chosen(topic_key)
    where length(btrim(chosen.topic_key)) not between 38 and 1040
       or not exists (
         select 1 from public.step2_question_details detail
         where detail.system_category_id::text || ':' || detail.topic = chosen.topic_key
           and detail.system_category_id = any(selected_system_ids)
       )
  ) then
    raise exception 'Step 2 CK topic selection is invalid' using errcode = '23514';
  end if;

  select count(*) into result
  from public.eligible_step2_question_ids(
    selected_exam_id, usage_modes, selected_system_ids,
    selected_clinical_science_ids, selected_competency_ids, selected_topics,
    selected_difficulties, nutrition_filter
  );
  return result;
end;
$$;

create function public.student_create_step2_block(
  selected_exam_id uuid,
  selected_mode public.study_mode,
  usage_modes public.question_usage_filter[],
  selected_system_ids uuid[],
  selected_clinical_science_ids uuid[],
  selected_competency_ids uuid[],
  selected_topics text[],
  selected_difficulties public.difficulty_level[],
  nutrition_filter text,
  requested_count integer
) returns uuid
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  eligible_count integer;
  pool_size integer;
  start_offset integer;
  seed bigint;
  new_block_id uuid;
begin
  perform public.assert_paid_student();
  if requested_count not between 1 and 20 then
    raise exception 'Step 2 CK blocks contain between 1 and 20 questions' using errcode = '22023';
  end if;

  select public.student_step2_eligible_question_count(
    selected_exam_id, usage_modes, selected_system_ids,
    selected_clinical_science_ids, selected_competency_ids, selected_topics,
    selected_difficulties, nutrition_filter
  )::integer into eligible_count;
  if requested_count > eligible_count then
    raise exception 'not enough eligible questions' using errcode = '23514';
  end if;

  seed := floor(random() * 9223372036854775807)::bigint;
  pool_size := least(eligible_count, greatest(requested_count * 20, 200));
  start_offset := case
    when eligible_count > pool_size
      then floor(random() * (eligible_count - pool_size + 1))::integer
    else 0
  end;

  insert into public.test_blocks(
    user_id, exam_id, mode, status, requested_question_count,
    actual_question_count, time_limit_seconds, generation_metadata
  ) values (
    auth.uid(), selected_exam_id, selected_mode, 'created', requested_count,
    requested_count, case when selected_mode = 'timed' then requested_count * 90 else null end,
    jsonb_build_object(
      'selectionMap', 'step2-v1',
      'seed', seed,
      'usageModes', usage_modes,
      'systemIds', selected_system_ids,
      'clinicalScienceIds', selected_clinical_science_ids,
      'competencyIds', selected_competency_ids,
      'topicSelections', selected_topics,
      'difficulties', selected_difficulties,
      'nutritionFilter', nutrition_filter,
      'candidatePoolSize', pool_size
    )
  ) returning id into new_block_id;

  with candidate_pool as materialized (
    select question_id
    from public.eligible_step2_question_ids(
      selected_exam_id, usage_modes, selected_system_ids,
      selected_clinical_science_ids, selected_competency_ids, selected_topics,
      selected_difficulties, nutrition_filter
    )
    order by question_id
    offset start_offset
    limit pool_size
  ), selected as (
    select question_id,
      row_number() over (order by md5(question_id::text || seed::text))::integer as position
    from candidate_pool
    order by md5(question_id::text || seed::text)
    limit requested_count
  )
  insert into public.test_block_questions(block_id, question_id, position, option_order)
  select new_block_id, selected.question_id, selected.position,
    (
      select jsonb_agg(option.id order by md5(option.id::text || seed::text))
      from public.question_options option
      where option.question_id = selected.question_id
    )
  from selected;

  if (select count(*) from public.test_block_questions where block_id = new_block_id) <> requested_count then
    raise exception 'block generation did not produce requested membership' using errcode = 'P0001';
  end if;
  return new_block_id;
end;
$$;

revoke all on function public.student_step2_test_builder_map(uuid) from public;
revoke all on function public.eligible_step2_question_ids(uuid, public.question_usage_filter[], uuid[], uuid[], uuid[], text[], public.difficulty_level[], text) from public;
revoke all on function public.student_step2_eligible_question_count(uuid, public.question_usage_filter[], uuid[], uuid[], uuid[], text[], public.difficulty_level[], text) from public;
revoke all on function public.student_create_step2_block(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], uuid[], text[], public.difficulty_level[], text, integer) from public;

grant execute on function public.student_step2_test_builder_map(uuid) to authenticated;
grant execute on function public.student_step2_eligible_question_count(uuid, public.question_usage_filter[], uuid[], uuid[], uuid[], text[], public.difficulty_level[], text) to authenticated;
grant execute on function public.student_create_step2_block(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], uuid[], text[], public.difficulty_level[], text, integer) to authenticated;

commit;
