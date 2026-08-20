begin;

-- Present the clinical taxonomy requested by the test builder while retaining
-- stable legacy slugs used by existing imports.
update public.subjects set name = 'Pediatrics'
where slug = 'paediatrics';
update public.subjects set name = 'Obstetrics and Gynecology'
where slug = 'obstetrics-and-gynaecology';

update public.categories set active = false;

do $$
declare
  exam record;
  item record;
  saved_system_id uuid;
begin
  for exam in select id from public.exams loop
    for item in
      select *
      from (values
        ('allergy-and-immunology', 'Allergy and Immunology', 1),
        ('biostatistics-and-epidemiology', 'Biostatistics and Epidemiology', 2),
        ('cardiovascular', 'Cardiovascular System', 3),
        ('dermatology', 'Dermatology', 4),
        ('ear-nose-and-throat', 'Ear, Nose & Throat (ENT)', 5),
        ('endocrine', 'Endocrine, Diabetes & Metabolism', 6),
        ('female-reproductive', 'Female Reproductive System & Breast', 7),
        ('gastrointestinal', 'Gastrointestinal & Nutrition', 8),
        ('general-principles', 'General Principles', 9),
        ('hematology-and-oncology', 'Hematology & Oncology', 10),
        ('infectious-diseases', 'Infectious Diseases', 11),
        ('male-reproductive', 'Male Reproductive System', 12),
        ('nervous-system', 'Nervous System', 13),
        ('ophthalmology', 'Ophthalmology', 14),
        ('poisoning-and-environmental', 'Poisoning & Environmental', 15),
        ('pregnancy-and-childbirth', 'Pregnancy, Childbirth & Puerperium', 16),
        ('psychiatric-behavioral-and-substance-use', 'Psychiatric/Behavioral & Substance Use Disorders', 17),
        ('pulmonary-and-critical-care', 'Pulmonary & Critical Care', 18),
        ('renal-and-urinary', 'Renal, Urinary Systems & Electrolytes', 19),
        ('rheumatology-orthopedics-and-sports', 'Rheumatology/Orthopedics & Sports', 20),
        ('social-sciences', 'Social Sciences (Ethics/Legal/Professional)', 21)
      ) as systems(slug, name, sort_order)
    loop
      insert into public.categories(exam_id, slug, name, sort_order, active)
      values(exam.id, item.slug, item.name, item.sort_order, true)
      on conflict (exam_id, slug) do update
        set name = excluded.name, sort_order = excluded.sort_order, active = true
      returning id into saved_system_id;
    end loop;
  end loop;
end $$;

-- Systems are available beneath subjects. Medicine intentionally spans all
-- systems; overlapping clinical questions can have several subject mappings.
insert into public.subject_categories(subject_id, category_id)
select s.id, c.id
from public.subjects s
join public.categories c on c.exam_id = s.exam_id and c.active
where
  s.slug = 'medicine'
  or (s.slug = 'surgery' and c.slug in (
    'cardiovascular', 'dermatology', 'ear-nose-and-throat',
    'female-reproductive', 'gastrointestinal', 'general-principles',
    'hematology-and-oncology', 'male-reproductive', 'nervous-system',
    'ophthalmology', 'pulmonary-and-critical-care', 'renal-and-urinary',
    'rheumatology-orthopedics-and-sports'
  ))
  or (s.slug = 'psychiatry' and c.slug in (
    'nervous-system', 'poisoning-and-environmental',
    'psychiatric-behavioral-and-substance-use', 'social-sciences'
  ))
  or (s.slug = 'paediatrics' and c.slug in (
    'allergy-and-immunology', 'cardiovascular', 'dermatology',
    'ear-nose-and-throat', 'endocrine', 'gastrointestinal',
    'general-principles', 'hematology-and-oncology', 'infectious-diseases',
    'nervous-system', 'ophthalmology', 'poisoning-and-environmental',
    'pulmonary-and-critical-care', 'renal-and-urinary',
    'rheumatology-orthopedics-and-sports', 'social-sciences'
  ))
  or (s.slug = 'obstetrics-and-gynaecology' and c.slug in (
    'endocrine', 'female-reproductive', 'general-principles',
    'hematology-and-oncology', 'infectious-diseases',
    'pregnancy-and-childbirth', 'social-sciences'
  ))
on conflict do nothing;

-- A question may have many subjects but exactly one system.
with ranked as (
  select
    qc.question_id,
    qc.category_id,
    row_number() over (
      partition by qc.question_id
      order by c.sort_order, qc.category_id
    ) as position
  from public.question_categories qc
  join public.categories c on c.id = qc.category_id
)
delete from public.question_categories qc
using ranked r
where qc.question_id = r.question_id
  and qc.category_id = r.category_id
  and r.position > 1;

create unique index question_categories_one_system_idx
on public.question_categories(question_id);

create function public.eligible_question_ids_v2(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns table(question_id uuid)
language sql stable security definer set search_path = '' as $$
  select q.id
  from public.questions q
  where q.exam_id = selected_exam_id
    and q.status = 'live'
    and cardinality(selected_subject_ids) > 0
    and cardinality(usage_modes) > 0
    and exists (
      select 1
      from public.question_subjects qs
      where qs.question_id = q.id
        and qs.subject_id = any(selected_subject_ids)
    )
    and (
      cardinality(selected_category_ids) = 0
      or exists (
        select 1
        from public.question_categories qc
        where qc.question_id = q.id
          and qc.category_id = any(selected_category_ids)
      )
    )
    and (
      ('unused' = any(usage_modes) and not exists (
        select 1 from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
      ))
      or ('incorrect' = any(usage_modes) and false = (
        select a.is_correct
        from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
        order by a.answered_at desc, a.id desc
        limit 1
      ))
      or ('correct' = any(usage_modes) and true = (
        select a.is_correct
        from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
        order by a.answered_at desc, a.id desc
        limit 1
      ))
      or ('marked' = any(usage_modes) and exists (
        select 1 from public.user_question_marks m
        where m.user_id = auth.uid() and m.question_id = q.id
      ))
    )
$$;
revoke all on function public.eligible_question_ids_v2(uuid,public.question_usage_filter[],uuid[],uuid[]) from public;

create function public.student_eligible_question_count_v2(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns bigint
language plpgsql stable security definer set search_path = '' as $$
declare
  result bigint;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'student role required' using errcode = '42501';
  end if;
  if cardinality(usage_modes) not between 1 and 4
     or usage_modes && array['all','used']::public.question_usage_filter[] then
    raise exception 'select one or more supported question types' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(selected_subject_ids) as chosen(value)
    left join public.subjects s
      on s.id = chosen.value and s.exam_id = selected_exam_id and s.active
    where s.id is null
  ) or exists (
    select 1
    from unnest(selected_category_ids) as chosen(value)
    left join public.categories c
      on c.id = chosen.value and c.exam_id = selected_exam_id and c.active
    where c.id is null
  ) then
    raise exception 'taxonomy does not match exam' using errcode = '23514';
  end if;
  if exists (
    select 1
    from unnest(selected_category_ids) chosen(category_id)
    where not exists (
      select 1
      from public.subject_categories sc
      where sc.category_id = chosen.category_id
        and sc.subject_id = any(selected_subject_ids)
    )
  ) then
    raise exception 'system is not available for the selected subjects' using errcode = '23514';
  end if;
  select count(*) into result
  from public.eligible_question_ids_v2(
    selected_exam_id,
    usage_modes,
    selected_subject_ids,
    selected_category_ids
  );
  return result;
end $$;
revoke all on function public.student_eligible_question_count_v2(uuid,public.question_usage_filter[],uuid[],uuid[]) from public;
grant execute on function public.student_eligible_question_count_v2(uuid,public.question_usage_filter[],uuid[],uuid[]) to authenticated;

create function public.student_create_block_v2(
  selected_exam_id uuid,
  selected_mode public.study_mode,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[],
  requested_count integer
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  eligible_count integer;
  pool_size integer;
  start_offset integer;
  seed bigint;
  new_block_id uuid;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'student role required' using errcode = '42501';
  end if;
  if requested_count not between 1 and 200 then
    raise exception 'requested count must be between 1 and 200' using errcode = '22023';
  end if;
  select public.student_eligible_question_count_v2(
    selected_exam_id,
    usage_modes,
    selected_subject_ids,
    selected_category_ids
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
    user_id,
    exam_id,
    mode,
    status,
    requested_question_count,
    actual_question_count,
    time_limit_seconds,
    generation_metadata
  ) values (
    auth.uid(),
    selected_exam_id,
    selected_mode,
    'created',
    requested_count,
    requested_count,
    case when selected_mode = 'timed' then requested_count * 90 else null end,
    jsonb_build_object(
      'seed', seed,
      'usageModes', usage_modes,
      'subjectIds', selected_subject_ids,
      'systemIds', selected_category_ids,
      'candidatePoolSize', pool_size
    )
  ) returning id into new_block_id;

  with candidate_pool as materialized (
    select question_id
    from public.eligible_question_ids_v2(
      selected_exam_id,
      usage_modes,
      selected_subject_ids,
      selected_category_ids
    )
    order by question_id
    offset start_offset
    limit pool_size
  ), selected as (
    select
      question_id,
      row_number() over (
        order by md5(question_id::text || seed::text)
      )::integer as position
    from candidate_pool
    order by md5(question_id::text || seed::text)
    limit requested_count
  )
  insert into public.test_block_questions(
    block_id,
    question_id,
    position,
    option_order
  )
  select
    new_block_id,
    selected.question_id,
    selected.position,
    (
      select jsonb_agg(o.id order by md5(o.id::text || seed::text))
      from public.question_options o
      where o.question_id = selected.question_id
    )
  from selected;

  if (
    select count(*)
    from public.test_block_questions
    where block_id = new_block_id
  ) <> requested_count then
    raise exception 'block generation did not produce requested membership' using errcode = 'P0001';
  end if;
  return new_block_id;
end $$;
revoke all on function public.student_create_block_v2(uuid,public.study_mode,public.question_usage_filter[],uuid[],uuid[],integer) from public;
grant execute on function public.student_create_block_v2(uuid,public.study_mode,public.question_usage_filter[],uuid[],uuid[],integer) to authenticated;

create function public.student_test_builder_taxonomy_counts(
  selected_exam_id uuid
) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if public.current_user_role() <> 'student' then
    raise exception 'student role required' using errcode = '42501';
  end if;
  select jsonb_build_object(
    'subjects',
    coalesce((
      select jsonb_object_agg(s.id::text, counts.question_count)
      from public.subjects s
      cross join lateral (
        select count(distinct qs.question_id) as question_count
        from public.question_subjects qs
        join public.questions q on q.id = qs.question_id
        where qs.subject_id = s.id and q.status = 'live'
      ) counts
      where s.exam_id = selected_exam_id and s.active
    ), '{}'::jsonb),
    'systems',
    coalesce((
      select jsonb_object_agg(c.id::text, counts.question_count)
      from public.categories c
      cross join lateral (
        select count(distinct qc.question_id) as question_count
        from public.question_categories qc
        join public.questions q on q.id = qc.question_id
        where qc.category_id = c.id and q.status = 'live'
      ) counts
      where c.exam_id = selected_exam_id and c.active
    ), '{}'::jsonb)
  ) into result;
  return result;
end $$;
revoke all on function public.student_test_builder_taxonomy_counts(uuid) from public;
grant execute on function public.student_test_builder_taxonomy_counts(uuid) to authenticated;

commit;
