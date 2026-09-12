begin;
-- Question storage v1 is the schema and authoring workflow that existed before
-- the Step 1 vault importer. It is intentionally retained in place. Step 1
-- vault questions use v2 and add exam-specific metadata without changing the
-- contract used by Step 2 CK or Step 3.
alter table public.questions
  add column question_storage_version smallint not null default 1
  check (question_storage_version in (1, 2));
create table public.step1_system_catalog (
  category_id uuid primary key references public.categories(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z]{3}$'),
  blueprint_name text not null,
  created_at timestamptz not null default now()
);
create table public.step1_discipline_catalog (
  subject_id uuid primary key references public.subjects(id) on delete restrict,
  code text not null check (code ~ '^[A-Z]{3}$'),
  blueprint_name text not null,
  official_axis boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.step1_discipline_aliases (
  alias text primary key,
  subject_id uuid not null references public.subjects(id) on delete restrict
);
create table public.step1_competencies (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order integer not null check (sort_order > 0)
);
create table public.step1_question_details (
  question_id uuid primary key references public.questions(id) on delete cascade,
  question_code text not null unique
    check (question_code ~ '^S1-[A-Z]{3}-[A-Z]{3}-[0-9]{4}$'),
  batch_id text not null check (char_length(btrim(batch_id)) between 1 and 100),
  system_category_id uuid not null references public.categories(id) on delete restrict,
  system_code text not null check (system_code ~ '^[A-Z]{3}$'),
  primary_discipline_id uuid not null references public.subjects(id) on delete restrict,
  competency_id uuid not null references public.step1_competencies(id) on delete restrict,
  topic text not null check (char_length(btrim(topic)) between 1 and 1000),
  reviewer_flags text not null default '',
  source_status text not null,
  source_review_status text not null
    check (source_review_status in ('draft','queue','review','approved','revise','live')),
  effective_review_status text not null
    check (effective_review_status in ('draft','queue','review','approved','revise','live')),
  demo_approval_override boolean not null default false,
  approval_override_reason text,
  reviewer_name text,
  approved_date date,
  drafted_date date not null,
  notes text not null default '',
  source_filename text,
  original_payload jsonb not null check (jsonb_typeof(original_payload) = 'object'),
  imported_by uuid not null references public.profiles(id) on delete restrict,
  imported_at timestamptz not null default now(),
  unique (question_id, system_category_id),
  check (
    not demo_approval_override
    or (effective_review_status = 'approved' and approval_override_reason is not null)
  )
);
create index step1_details_batch_idx on public.step1_question_details(batch_id);
create index step1_details_system_idx on public.step1_question_details(system_category_id);
create index step1_details_primary_discipline_idx on public.step1_question_details(primary_discipline_id);
create index step1_details_competency_idx on public.step1_question_details(competency_id);
alter table public.step1_system_catalog enable row level security;
alter table public.step1_discipline_catalog enable row level security;
alter table public.step1_discipline_aliases enable row level security;
alter table public.step1_competencies enable row level security;
alter table public.step1_question_details enable row level security;
create policy step1_catalog_authenticated_read on public.step1_system_catalog
for select to authenticated using (true);
create policy step1_discipline_catalog_authenticated_read on public.step1_discipline_catalog
for select to authenticated using (true);
create policy step1_discipline_aliases_staff_read on public.step1_discipline_aliases
for select to authenticated using (public.current_user_role() in ('reviewer','admin'));
create policy step1_competencies_authenticated_read on public.step1_competencies
for select to authenticated using (true);
create policy step1_details_staff_read on public.step1_question_details
for select to authenticated using (public.current_user_role() in ('reviewer','admin'));
grant select on public.step1_system_catalog, public.step1_discipline_catalog,
  public.step1_competencies to authenticated;
grant select on public.step1_discipline_aliases, public.step1_question_details to authenticated;
insert into public.step1_competencies(code, name, sort_order) values
  ('foundational-science', 'Medical Knowledge: Applying Foundational Science Concepts', 1),
  ('history-physical', 'Patient Care: History/Physical Examination', 2),
  ('diagnosis', 'Patient Care: Diagnosis', 3),
  ('communication', 'Communication and Interpersonal Skills', 4),
  ('practice-learning', 'Practice-based Learning & Improvement', 5)
on conflict (code) do update set name = excluded.name, sort_order = excluded.sort_order;
create function public.setup_step1_question_taxonomy()
returns void language plpgsql security definer set search_path = '' as $$
declare
  step1_exam_id uuid;
  item record;
  saved_id uuid;
begin
  select id into step1_exam_id from public.exams where code = 'step1';
  if step1_exam_id is null then
    return;
  end if;

  -- Retain legacy taxonomy rows, but remove them from new Step 1 selectors.
  update public.subjects set active = false where exam_id = step1_exam_id;
  update public.categories set active = false where exam_id = step1_exam_id;

  for item in select * from (values
    ('gross-anatomy-and-embryology','Gross Anatomy & Embryology','ANA',true,1),
    ('physiology','Physiology','PHY',true,2),
    ('biochemistry','Biochemistry','BIO',true,3),
    ('genetics','Genetics','GEN',true,4),
    ('histology-and-cell-biology','Histology & Cell Biology','HIS',true,5),
    ('microbiology','Microbiology','MIC',true,6),
    ('immunology','Immunology','IMM',true,7),
    ('pathology','Pathology','PAT',true,8),
    ('pharmacology','Pharmacology','PHA',true,9),
    ('nutrition','Nutrition','NUT',true,10),
    ('behavioral-sciences','Behavioral Sciences','BEH',true,11),
    ('epidemiology','Epidemiology','EPI',false,12),
    ('social-sciences','Social Sciences','SOC',false,13)
  ) as disciplines(slug,name,code,official_axis,sort_order) loop
    insert into public.subjects(exam_id,slug,name,sort_order,active)
    values(step1_exam_id,item.slug,item.name,item.sort_order,true)
    on conflict (exam_id,slug) do update set
      name=excluded.name,sort_order=excluded.sort_order,active=true
    returning id into saved_id;
    insert into public.step1_discipline_catalog(subject_id,code,blueprint_name,official_axis)
    values(saved_id,item.code,item.name,item.official_axis)
    on conflict (subject_id) do update set
      code=excluded.code,blueprint_name=excluded.blueprint_name,official_axis=excluded.official_axis;
    insert into public.step1_discipline_aliases(alias,subject_id)
    values(item.name,saved_id)
    on conflict (alias) do update set subject_id=excluded.subject_id;
    if item.slug = 'gross-anatomy-and-embryology' then
      insert into public.step1_discipline_aliases(alias,subject_id)
      values('Anatomy',saved_id)
      on conflict (alias) do update set subject_id=excluded.subject_id;
    end if;
  end loop;

  for item in select * from (values
    ('allergy-and-immunology','Allergy & Immunology','ALL',1),
    ('biostatistics-and-epidemiology','Biostatistics & Epidemiology/Population Health','BST',2),
    ('cardiovascular','Cardiovascular System','CVS',3),
    ('dermatology','Dermatology','DRM',4),
    ('endocrine','Endocrine, Diabetes & Metabolism','END',5),
    ('ear-nose-and-throat','Ear, Nose & Throat (ENT)','ENT',6),
    ('female-reproductive','Female Reproductive System & Breast','FRP',7),
    ('gastrointestinal','Gastrointestinal & Nutrition','GIN',8),
    ('general-principles','General Principles / Multisystem Processes','GPM',9),
    ('human-development','Human Development','HDV',10),
    ('hematology-and-oncology','Hematology & Oncology','HEM',11),
    ('infectious-diseases','Infectious Diseases','INF',12),
    ('male-reproductive','Male Reproductive System','MRP',13),
    ('nervous-system','Nervous System','NRV',14),
    ('ophthalmology','Ophthalmology','OPH',15),
    ('pregnancy-and-childbirth','Pregnancy, Childbirth & Puerperium','PRG',16),
    ('poisoning-and-environmental','Poisoning & Environmental Exposure','PSN',17),
    ('psychiatric-behavioral-and-substance-use','Psychiatric/Behavioral & Substance Use Disorders','PSY',18),
    ('pulmonary-and-critical-care','Pulmonary & Critical Care','PUL',19),
    ('renal-and-urinary','Renal, Urinary Systems & Electrolytes','REN',20),
    ('rheumatology-orthopedics-and-sports','Rheumatology/Orthopedics & Sports','RHE',21),
    ('social-sciences','Social Sciences (Ethics/Legal/Professional/Communication)','SOC',22)
  ) as systems(slug,name,code,sort_order) loop
    insert into public.categories(exam_id,slug,name,sort_order,active)
    values(step1_exam_id,item.slug,item.name,item.sort_order,true)
    on conflict (exam_id,slug) do update set
      name=excluded.name,sort_order=excluded.sort_order,active=true
    returning id into saved_id;
    insert into public.step1_system_catalog(category_id,code,blueprint_name)
    values(saved_id,item.code,item.name)
    on conflict (category_id) do update set code=excluded.code,blueprint_name=excluded.blueprint_name;
  end loop;

  -- Step 1 disciplines are cross-cutting axes over the organ/system outline.
  insert into public.subject_categories(subject_id,category_id)
  select d.subject_id,s.category_id
  from public.step1_discipline_catalog d cross join public.step1_system_catalog s
  on conflict do nothing;
end $$;
revoke all on function public.setup_step1_question_taxonomy() from public;
select public.setup_step1_question_taxonomy();
create function public.step1_glossary_json(raw_glossary text)
returns jsonb language plpgsql immutable set search_path = '' as $$
declare
  entry text;
  separator integer;
  result jsonb := '[]'::jsonb;
begin
  if nullif(btrim(raw_glossary),'') is null then return result; end if;
  foreach entry in array regexp_split_to_array(raw_glossary, '\s*;\s*') loop
    separator := strpos(entry, '=');
    if separator > 1 then
      result := result || jsonb_build_array(jsonb_build_object(
        'term', btrim(substr(entry,1,separator-1)),
        'definition', btrim(substr(entry,separator+1))
      ));
    else
      result := result || jsonb_build_array(jsonb_build_object(
        'term', btrim(entry), 'definition', ''
      ));
    end if;
  end loop;
  return result;
end $$;
create function public.admin_import_step1_questions(payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := auth.uid();
  trusted_import boolean := coalesce(auth.jwt()->>'role','') = 'service_role';
  step1_exam_id uuid;
  source_filename text := nullif(btrim(payload->>'sourceFilename'),'');
  question_row jsonb;
  saved_question_id uuid;
  system_id uuid;
  primary_subject_id uuid;
  discipline_subject_id uuid;
  competency_id_value uuid;
  discipline_name text;
  discipline_names text[];
  option_count integer;
  keyed_position integer;
  option_index integer;
  option_text_value text;
  explanation_value text;
  correct_explanation text;
  inserted_count integer := 0;
  skipped_count integer := 0;
  imported_ids jsonb := '[]'::jsonb;
  normalized_options text[];
begin
  if trusted_import then
    actor_id := nullif(payload->>'createdBy','')::uuid;
    if not exists(select 1 from public.profiles where id=actor_id and role='admin') then
      raise exception 'trusted imports require an administrator creator' using errcode='42501';
    end if;
  elsif public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode='42501';
  end if;
  if jsonb_typeof(payload->'questions') <> 'array'
     or jsonb_array_length(payload->'questions') not between 1 and 500 then
    raise exception 'questions must contain between 1 and 500 rows' using errcode='23514';
  end if;
  select id into step1_exam_id from public.exams where code='step1' and active;
  if step1_exam_id is null then raise exception 'active Step 1 exam not found'; end if;

  for question_row in select value from jsonb_array_elements(payload->'questions') loop
    if question_row->>'targetExam' <> 'USMLE Step 1' then
      raise exception 'targetExam must be USMLE Step 1' using errcode='23514';
    end if;
    if coalesce(question_row->>'questionId','') !~ '^S1-[A-Z]{3}-[A-Z]{3}-[0-9]{4}$' then
      raise exception 'invalid Step 1 questionId: %',question_row->>'questionId' using errcode='23514';
    end if;
    if exists(select 1 from public.step1_question_details where question_code=question_row->>'questionId') then
      skipped_count := skipped_count + 1;
      continue;
    end if;
    if nullif(btrim(question_row->>'batchId'),'') is null
       or length(btrim(question_row->>'stem')) not between 10 and 12000
       or nullif(btrim(question_row->>'topic'),'') is null
       or length(btrim(question_row->>'educationalObjective')) not between 10 and 4000
       or length(btrim(question_row->>'highYieldSummary')) not between 5 and 20000
       or length(btrim(question_row->>'imgNote')) > 10000 then
      raise exception 'required Step 1 content is missing or too long for %',question_row->>'questionId' using errcode='23514';
    end if;
    if question_row->>'difficulty' not in ('easy','medium','hard') then
      raise exception 'invalid difficulty for %',question_row->>'questionId' using errcode='23514';
    end if;
    if question_row->>'reviewStatus' not in ('draft','queue','review','approved','revise','live') then
      raise exception 'invalid source reviewStatus for %',question_row->>'questionId' using errcode='23514';
    end if;

    select c.id into system_id
    from public.categories c join public.step1_system_catalog sc on sc.category_id=c.id
    where c.exam_id=step1_exam_id and c.active
      and c.name=question_row->>'system' and sc.code=question_row->>'systemCode';
    if system_id is null then
      raise exception 'unknown Step 1 system/code for %',question_row->>'questionId' using errcode='23514';
    end if;
    if split_part(question_row->>'questionId','-',2) <> question_row->>'systemCode' then
      raise exception 'questionId system code mismatch for %',question_row->>'questionId' using errcode='23514';
    end if;

    select subject_id into primary_subject_id from public.step1_discipline_aliases
    where alias=question_row->>'primaryDiscipline';
    if primary_subject_id is null then
      raise exception 'unknown primary discipline for %',question_row->>'questionId' using errcode='23514';
    end if;
    discipline_names := regexp_split_to_array(question_row->>'discipline','\s*;\s*');
    if cardinality(discipline_names) not between 1 and 20 then
      raise exception 'one or more disciplines are required for %',question_row->>'questionId' using errcode='23514';
    end if;
    if not exists(
      select 1 from unnest(discipline_names) n
      join public.step1_discipline_aliases a on a.alias=n
      where a.subject_id=primary_subject_id
    ) then raise exception 'primary discipline must appear in discipline for %',question_row->>'questionId' using errcode='23514'; end if;
    if exists(
      select 1 from unnest(discipline_names) n
      left join public.step1_discipline_aliases a on a.alias=n
      where a.subject_id is null
    ) then raise exception 'unknown discipline for %',question_row->>'questionId' using errcode='23514'; end if;

    select id into competency_id_value from public.step1_competencies
    where name=question_row->>'competency';
    if competency_id_value is null then
      raise exception 'unknown competency for %',question_row->>'questionId' using errcode='23514';
    end if;

    option_count := 0;
    normalized_options := array[]::text[];
    for option_index in 1..8 loop
      option_text_value := btrim(coalesce(question_row->>('opt'||option_index),''));
      explanation_value := btrim(coalesce(question_row->>('exp'||option_index),''));
      if option_text_value <> '' then
        if option_index <> option_count+1 or explanation_value = '' then
          raise exception 'options must be contiguous and paired with explanations for %',question_row->>'questionId' using errcode='23514';
        end if;
        option_count := option_count+1;
        normalized_options := normalized_options || lower(regexp_replace(option_text_value,'\s+',' ','g'));
      elsif explanation_value <> '' then
        raise exception 'explanation without option for %',question_row->>'questionId' using errcode='23514';
      end if;
    end loop;
    if option_count not between 4 and 8
       or cardinality(normalized_options) <> cardinality(array(select distinct unnest(normalized_options))) then
      raise exception 'Step 1 questions require 4-8 unique options for %',question_row->>'questionId' using errcode='23514';
    end if;
    begin keyed_position := (question_row->>'keyedPosition')::integer;
    exception when others then raise exception 'invalid keyedPosition for %',question_row->>'questionId' using errcode='23514'; end;
    if keyed_position not between 1 and option_count then
      raise exception 'keyedPosition points outside the options for %',question_row->>'questionId' using errcode='23514';
    end if;
    correct_explanation := btrim(question_row->>('exp'||keyed_position));

    insert into public.questions(
      exam_id,stem,educational_objective,explanation,high_yield_summary,
      us_system_context_note,glossary,difficulty,status,key_phrases,
      source_references,accuracy_flags,reviewer_credit,reviewed_at,
      created_by,published_by,published_at,import_key,question_storage_version
    ) values (
      step1_exam_id,btrim(question_row->>'stem'),btrim(question_row->>'educationalObjective'),
      correct_explanation,btrim(question_row->>'highYieldSummary'),nullif(btrim(question_row->>'imgNote'),''),
      public.step1_glossary_json(question_row->>'glossary'),
      (question_row->>'difficulty')::public.difficulty_level,'live',
      coalesce(array(select btrim(v) from unnest(regexp_split_to_array(question_row->>'keyInfo','\s*,\s*')) v where btrim(v)<>''),array[]::text[]),
      '[]'::jsonb,
      case when nullif(btrim(question_row->>'reviewerFlags'),'') is null then '[]'::jsonb else jsonb_build_array(btrim(question_row->>'reviewerFlags')) end,
      nullif(btrim(question_row->>'reviewerName'),''),now(),actor_id,actor_id,now(),question_row->>'questionId',2
    ) returning id into saved_question_id;

    for option_index in 1..option_count loop
      option_text_value := btrim(question_row->>('opt'||option_index));
      explanation_value := btrim(question_row->>('exp'||option_index));
      insert into public.question_options(
        question_id,option_text,is_correct,distractor_rationale,explanation,sort_order
      ) values (
        saved_question_id,option_text_value,option_index=keyed_position,
        explanation_value,explanation_value,option_index-1
      );
    end loop;

    for discipline_name in select distinct unnest(discipline_names) loop
      select subject_id into discipline_subject_id from public.step1_discipline_aliases where alias=discipline_name;
      insert into public.question_subjects(question_id,subject_id,question_exam_id,subject_exam_id)
      values(saved_question_id,discipline_subject_id,step1_exam_id,step1_exam_id);
    end loop;
    insert into public.question_categories(question_id,category_id,question_exam_id,category_exam_id)
    values(saved_question_id,system_id,step1_exam_id,step1_exam_id);

    insert into public.step1_question_details(
      question_id,question_code,batch_id,system_category_id,system_code,
      primary_discipline_id,competency_id,topic,reviewer_flags,source_status,
      source_review_status,effective_review_status,demo_approval_override,
      approval_override_reason,reviewer_name,approved_date,drafted_date,notes,
      source_filename,original_payload,imported_by
    ) values (
      saved_question_id,question_row->>'questionId',btrim(question_row->>'batchId'),system_id,
      question_row->>'systemCode',primary_subject_id,competency_id_value,btrim(question_row->>'topic'),
      btrim(coalesce(question_row->>'reviewerFlags','')),btrim(question_row->>'sourceStatus'),
      question_row->>'reviewStatus','approved',true,
      'Temporary administrator approval for the initial client demonstration; physician review remains outstanding.',
      nullif(btrim(question_row->>'reviewerName'),''),nullif(question_row->>'approvedDate','')::date,
      (question_row->>'draftedDate')::date,btrim(coalesce(question_row->>'notes','')),
      source_filename,question_row,actor_id
    );

    insert into public.review_events(question_id,actor_id,actor_role,from_status,to_status,note,snapshot_version)
    values
      (saved_question_id,actor_id,'admin','draft','physician_approved',
       'DEMO OVERRIDE: temporarily marked approved; source file remains unreviewed and requires physician review.',1),
      (saved_question_id,actor_id,'admin','physician_approved','live',
       'Published for the initial client demonstration under the recorded temporary approval override.',1);
    inserted_count := inserted_count+1;
    imported_ids := imported_ids || jsonb_build_array(saved_question_id);
  end loop;
  return jsonb_build_object('inserted',inserted_count,'skipped',skipped_count,'questionIds',imported_ids);
end $$;
revoke all on function public.step1_glossary_json(text) from public;
revoke all on function public.admin_import_step1_questions(jsonb) from public;
grant execute on function public.admin_import_step1_questions(jsonb) to authenticated, service_role;
commit;
