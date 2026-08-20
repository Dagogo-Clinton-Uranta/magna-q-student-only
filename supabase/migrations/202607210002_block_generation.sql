begin;

create function public.eligible_question_ids(
  selected_exam_id uuid,
  usage_mode public.question_usage_filter,
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns table(question_id uuid) language sql stable security definer set search_path = '' as $$
  select q.id
  from public.questions q
  where q.exam_id = selected_exam_id
    and q.status = 'live'
    and cardinality(selected_subject_ids) > 0
    and exists (select 1 from public.question_subjects qs where qs.question_id = q.id and qs.subject_id = any(selected_subject_ids))
    and (cardinality(selected_category_ids) = 0 or exists (
      select 1 from public.question_categories qc where qc.question_id = q.id and qc.category_id = any(selected_category_ids)
    ))
    and case usage_mode
      when 'all' then true
      when 'unused' then not exists (select 1 from public.answer_logs a where a.user_id = auth.uid() and a.question_id = q.id)
      when 'used' then exists (select 1 from public.answer_logs a where a.user_id = auth.uid() and a.question_id = q.id)
      when 'incorrect' then false = (select a.is_correct from public.answer_logs a where a.user_id = auth.uid() and a.question_id = q.id order by a.answered_at desc, a.id desc limit 1)
      when 'correct' then true = (select a.is_correct from public.answer_logs a where a.user_id = auth.uid() and a.question_id = q.id order by a.answered_at desc, a.id desc limit 1)
      when 'marked' then exists (select 1 from public.user_question_marks m where m.user_id = auth.uid() and m.question_id = q.id)
    end
$$;
revoke all on function public.eligible_question_ids(uuid,public.question_usage_filter,uuid[],uuid[]) from public;

create function public.student_eligible_question_count(
  selected_exam_id uuid,
  usage_mode public.question_usage_filter,
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns bigint language plpgsql stable security definer set search_path = '' as $$
declare result bigint;
begin
  if public.current_user_role() <> 'student' then raise exception 'student role required' using errcode = '42501'; end if;
  if exists (select 1 from unnest(selected_subject_ids) as chosen(value) left join public.subjects s on s.id = chosen.value and s.exam_id = selected_exam_id where s.id is null) or
     exists (select 1 from unnest(selected_category_ids) as chosen(value) left join public.categories c on c.id = chosen.value and c.exam_id = selected_exam_id where c.id is null) then
    raise exception 'taxonomy does not match exam' using errcode = '23514';
  end if;
  select count(*) into result from public.eligible_question_ids(selected_exam_id, usage_mode, selected_subject_ids, selected_category_ids);
  return result;
end $$;
revoke all on function public.student_eligible_question_count(uuid,public.question_usage_filter,uuid[],uuid[]) from public;
grant execute on function public.student_eligible_question_count(uuid,public.question_usage_filter,uuid[],uuid[]) to authenticated;

create function public.student_create_block(
  selected_exam_id uuid,
  selected_mode public.study_mode,
  usage_mode public.question_usage_filter,
  selected_subject_ids uuid[],
  selected_category_ids uuid[],
  requested_count integer
) returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare eligible_count integer; pool_size integer; start_offset integer; seed bigint; new_block_id uuid;
begin
  if public.current_user_role() <> 'student' then raise exception 'student role required' using errcode = '42501'; end if;
  if requested_count not between 1 and 200 then raise exception 'requested count must be between 1 and 200' using errcode = '22023'; end if;
  select public.student_eligible_question_count(selected_exam_id, usage_mode, selected_subject_ids, selected_category_ids)::integer into eligible_count;
  if requested_count > eligible_count then raise exception 'not enough eligible questions' using errcode = '23514'; end if;
  seed := floor(random() * 9223372036854775807)::bigint;
  pool_size := least(eligible_count, greatest(requested_count * 20, 200));
  start_offset := case when eligible_count > pool_size then floor(random() * (eligible_count - pool_size + 1))::integer else 0 end;
  insert into public.test_blocks(user_id, exam_id, mode, status, requested_question_count, actual_question_count, time_limit_seconds, generation_metadata)
  values(auth.uid(), selected_exam_id, selected_mode, 'created', requested_count, requested_count,
    case when selected_mode = 'timed' then requested_count * 90 else null end,
    jsonb_build_object('seed', seed, 'usageMode', usage_mode, 'subjectIds', selected_subject_ids, 'categoryIds', selected_category_ids, 'candidatePoolSize', pool_size))
  returning id into new_block_id;

  with candidate_pool as materialized (
    select question_id from public.eligible_question_ids(selected_exam_id, usage_mode, selected_subject_ids, selected_category_ids)
    order by question_id offset start_offset limit pool_size
  ), selected as (
    select question_id, row_number() over (order by md5(question_id::text || seed::text))::integer as position
    from candidate_pool order by md5(question_id::text || seed::text) limit requested_count
  )
  insert into public.test_block_questions(block_id, question_id, position, option_order)
  select new_block_id, selected.question_id, selected.position,
    (select jsonb_agg(o.id order by md5(o.id::text || seed::text)) from public.question_options o where o.question_id = selected.question_id)
  from selected;
  if (select count(*) from public.test_block_questions where block_id = new_block_id) <> requested_count then
    raise exception 'block generation did not produce requested membership' using errcode = 'P0001';
  end if;
  return new_block_id;
end $$;
revoke all on function public.student_create_block(uuid,public.study_mode,public.question_usage_filter,uuid[],uuid[],integer) from public;
grant execute on function public.student_create_block(uuid,public.study_mode,public.question_usage_filter,uuid[],uuid[],integer) to authenticated;

commit;
