begin;
create policy exams_admin_write on public.exams for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy subjects_admin_write on public.subjects for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy categories_admin_write on public.categories for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy mappings_admin_write on public.subject_categories for all to authenticated
using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
create policy question_images_staff_read on storage.objects for select to authenticated
using (bucket_id = 'question-images' and public.current_user_role() in ('reviewer', 'admin'));
create policy question_images_admin_insert on storage.objects for insert to authenticated
with check (bucket_id = 'question-images' and public.current_user_role() = 'admin');
create policy question_images_admin_update on storage.objects for update to authenticated
using (bucket_id = 'question-images' and public.current_user_role() = 'admin')
with check (bucket_id = 'question-images' and public.current_user_role() = 'admin');
create function public.admin_save_question(payload jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  saved_id uuid;
  requested_id uuid := nullif(payload->>'id', '')::uuid;
  selected_exam uuid := (payload->>'examId')::uuid;
  expected_version integer := nullif(payload->>'expectedVersion', '')::integer;
  requested_status public.review_status := coalesce((payload->>'status')::public.review_status, 'draft');
  current_version integer;
  subject_value jsonb;
  category_value jsonb;
  option_value jsonb;
  actor_id uuid;
  trusted_import boolean := coalesce(auth.jwt()->>'role', '') = 'service_role';
begin
  if public.current_user_role() <> 'admin' and not trusted_import then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  actor_id := auth.uid();
  if trusted_import then
    actor_id := nullif(payload->>'createdBy', '')::uuid;
    if not exists (select 1 from public.profiles where id = actor_id and role = 'admin') then
      raise exception 'trusted imports require an administrator creator' using errcode = '42501';
    end if;
  end if;
  if requested_status not in ('draft', 'changes_requested', 'in_review') then
    raise exception 'invalid authoring status' using errcode = '22023';
  end if;
  if not exists (select 1 from public.exams where id = selected_exam) then
    raise exception 'exam not found' using errcode = '23503';
  end if;
  if jsonb_typeof(payload->'subjectIds') <> 'array' or jsonb_array_length(payload->'subjectIds') < 1 then
    raise exception 'at least one subject is required' using errcode = '23514';
  end if;
  if jsonb_typeof(payload->'categoryIds') <> 'array' or jsonb_array_length(payload->'categoryIds') < 1 then
    raise exception 'at least one category is required' using errcode = '23514';
  end if;
  if jsonb_typeof(payload->'options') <> 'array' or jsonb_array_length(payload->'options') not between 2 and 8 then
    raise exception 'between two and eight options are required' using errcode = '23514';
  end if;
  if (select count(*) from jsonb_array_elements(payload->'options') option_row where (option_row->>'isCorrect')::boolean) <> 1 then
    raise exception 'exactly one correct option is required' using errcode = '23514';
  end if;
  if exists (select 1 from jsonb_array_elements(payload->'options') option_row where length(btrim(option_row->>'optionText')) = 0) then
    raise exception 'empty options are not allowed' using errcode = '23514';
  end if;
  if (select count(*) from jsonb_array_elements(payload->'options')) <>
     (select count(distinct lower(regexp_replace(btrim(option_row->>'optionText'), '\s+', ' ', 'g'))) from jsonb_array_elements(payload->'options') option_row) then
    raise exception 'duplicate options are not allowed' using errcode = '23514';
  end if;
  if requested_status = 'in_review' and (jsonb_typeof(payload->'sourceReferences') <> 'array' or jsonb_array_length(payload->'sourceReferences') < 2) then
    raise exception 'at least two sources are required before review' using errcode = '23514';
  end if;
  if exists (
    select 1 from jsonb_array_elements_text(payload->'subjectIds') selected
    left join public.subjects subject on subject.id = selected::uuid and subject.exam_id = selected_exam
    where subject.id is null
  ) then raise exception 'subject does not belong to exam' using errcode = '23514'; end if;
  if exists (
    select 1 from jsonb_array_elements_text(payload->'categoryIds') selected
    left join public.categories category on category.id = selected::uuid and category.exam_id = selected_exam
    where category.id is null
  ) then raise exception 'category does not belong to exam' using errcode = '23514'; end if;

  if requested_id is null then
    insert into public.questions (
      exam_id, stem, educational_objective, explanation, high_yield_summary, us_system_context_note,
      glossary, image_path, difficulty, status, source_references, accuracy_flags, reviewer_credit, created_by, import_key
    ) values (
      selected_exam, payload->>'stem', payload->>'educationalObjective', payload->>'explanation', payload->>'highYieldSummary',
      nullif(payload->>'usSystemContextNote',''), coalesce(payload->'glossary','[]'::jsonb), nullif(payload->>'imagePath',''),
      (payload->>'difficulty')::public.difficulty_level, requested_status, coalesce(payload->'sourceReferences','[]'::jsonb),
      coalesce(payload->'accuracyFlags','[]'::jsonb), nullif(payload->>'reviewerCredit',''), actor_id, nullif(payload->>'importKey','')
    ) returning id into saved_id;
  else
    select version into current_version from public.questions where id = requested_id for update;
    if current_version is null then raise exception 'question not found' using errcode = 'P0002'; end if;
    if expected_version is null or current_version <> expected_version then
      raise exception 'question was changed by another editor' using errcode = '40001';
    end if;
    if exists (select 1 from public.questions where id = requested_id and status not in ('draft','changes_requested','in_review')) then
      raise exception 'approved or published questions cannot be edited here' using errcode = '23514';
    end if;
    update public.questions set
      exam_id = selected_exam, stem = payload->>'stem', educational_objective = payload->>'educationalObjective',
      explanation = payload->>'explanation', high_yield_summary = payload->>'highYieldSummary',
      us_system_context_note = nullif(payload->>'usSystemContextNote',''), glossary = coalesce(payload->'glossary','[]'::jsonb),
      image_path = nullif(payload->>'imagePath',''), difficulty = (payload->>'difficulty')::public.difficulty_level,
      status = requested_status, source_references = coalesce(payload->'sourceReferences','[]'::jsonb),
      accuracy_flags = coalesce(payload->'accuracyFlags','[]'::jsonb), reviewer_credit = nullif(payload->>'reviewerCredit',''),
      version = version + 1
    where id = requested_id returning id into saved_id;
    delete from public.question_options where question_id = saved_id;
    delete from public.question_subjects where question_id = saved_id;
    delete from public.question_categories where question_id = saved_id;
  end if;

  for option_value in select value from jsonb_array_elements(payload->'options') loop
    insert into public.question_options(question_id, option_text, is_correct, distractor_rationale, sort_order)
    values(saved_id, option_value->>'optionText', (option_value->>'isCorrect')::boolean, nullif(option_value->>'distractorRationale',''), (option_value->>'sortOrder')::integer);
  end loop;
  for subject_value in select value from jsonb_array_elements(payload->'subjectIds') loop
    insert into public.question_subjects(question_id, subject_id, question_exam_id, subject_exam_id)
    values(saved_id, (subject_value#>>'{}')::uuid, selected_exam, selected_exam);
  end loop;
  for category_value in select value from jsonb_array_elements(payload->'categoryIds') loop
    insert into public.question_categories(question_id, category_id, question_exam_id, category_exam_id)
    values(saved_id, (category_value#>>'{}')::uuid, selected_exam, selected_exam);
  end loop;
  return saved_id;
end $$;
revoke all on function public.admin_save_question(jsonb) from public;
grant execute on function public.admin_save_question(jsonb) to authenticated;
commit;
