begin;

-- Storage versions remain additive: v1 is the legacy four-option intake, v2
-- is the Step 1 vault contract, and v3 is the Step 2 CK vault contract.
alter table public.questions
  drop constraint if exists questions_question_storage_version_check;
alter table public.questions
  add constraint questions_question_storage_version_check
  check (question_storage_version in (1, 2, 3));

create table public.step2_system_catalog (
  category_id uuid primary key references public.categories(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z]{3}$'),
  blueprint_name text not null,
  created_at timestamptz not null default now()
);

create table public.step2_discipline_catalog (
  subject_id uuid primary key references public.subjects(id) on delete restrict,
  code text not null unique check (code ~ '^[A-Z]{3}$'),
  blueprint_name text not null,
  primary_allowed boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.step2_discipline_aliases (
  alias text primary key,
  subject_id uuid not null references public.subjects(id) on delete restrict
);

create table public.step2_competencies (
  id uuid primary key default extensions.gen_random_uuid(),
  code text not null unique,
  name text not null unique,
  sort_order integer not null check (sort_order > 0)
);

create table public.step2_question_details (
  question_id uuid primary key references public.questions(id) on delete cascade,
  question_code text not null unique
    check (question_code ~ '^S2-[A-Z]{3}-[0-9]{4}$'),
  batch_id text not null check (char_length(btrim(batch_id)) between 1 and 100),
  system_category_id uuid not null references public.categories(id) on delete restrict,
  system_code text not null check (system_code ~ '^[A-Z]{3}$'),
  primary_discipline_id uuid not null references public.subjects(id) on delete restrict,
  competency_id uuid not null references public.step2_competencies(id) on delete restrict,
  nutrition_tagged boolean not null default false,
  topic text not null check (char_length(btrim(topic)) between 1 and 1000),
  reviewer_flags text not null check (char_length(btrim(reviewer_flags)) > 0),
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

create index step2_details_batch_idx on public.step2_question_details(batch_id);
create index step2_details_system_idx on public.step2_question_details(system_category_id);
create index step2_details_primary_discipline_idx on public.step2_question_details(primary_discipline_id);
create index step2_details_competency_idx on public.step2_question_details(competency_id);
create index step2_details_nutrition_idx on public.step2_question_details(nutrition_tagged)
where nutrition_tagged;

alter table public.step2_system_catalog enable row level security;
alter table public.step2_discipline_catalog enable row level security;
alter table public.step2_discipline_aliases enable row level security;
alter table public.step2_competencies enable row level security;
alter table public.step2_question_details enable row level security;

create policy step2_catalog_authenticated_read on public.step2_system_catalog
for select to authenticated using (true);
create policy step2_discipline_catalog_authenticated_read on public.step2_discipline_catalog
for select to authenticated using (true);
create policy step2_discipline_aliases_staff_read on public.step2_discipline_aliases
for select to authenticated using (public.current_user_role() in ('reviewer','admin'));
create policy step2_competencies_authenticated_read on public.step2_competencies
for select to authenticated using (true);
create policy step2_details_staff_read on public.step2_question_details
for select to authenticated using (public.current_user_role() in ('reviewer','admin'));

grant select on public.step2_system_catalog, public.step2_discipline_catalog,
  public.step2_competencies to authenticated;
grant select on public.step2_discipline_aliases, public.step2_question_details to authenticated;

insert into public.step2_competencies(code, name, sort_order) values
  ('diagnosis', 'Patient Care: Diagnosis', 1),
  ('laboratory-diagnostic', 'Patient Care: Laboratory/Diagnostic Studies', 2),
  ('mixed-management', 'Patient Care: Mixed Management', 3),
  ('pharmacotherapy', 'Patient Care: Pharmacotherapy', 4),
  ('clinical-interventions', 'Patient Care: Clinical Interventions', 5),
  ('health-maintenance', 'Patient Care: Health Maintenance/Disease Prevention', 6),
  ('prognosis', 'Patient Care: Prognosis/Outcome', 7),
  ('systems-safety', 'Systems-based Practice & Patient Safety', 8),
  ('professionalism', 'Professionalism', 9),
  ('practice-learning', 'Practice-based Learning & Improvement', 10)
on conflict (code) do update set name=excluded.name, sort_order=excluded.sort_order;

create function public.setup_step2_question_taxonomy()
returns void language plpgsql security definer set search_path = '' as $$
declare
  step2_exam_id uuid;
  item record;
  saved_id uuid;
begin
  select id into step2_exam_id from public.exams where code='step2ck';
  if step2_exam_id is null then return; end if;

  update public.subjects set active=false where exam_id=step2_exam_id;
  update public.categories set active=false where exam_id=step2_exam_id;

  for item in select * from (values
    ('medicine','Medicine','MED',true,1),
    ('paediatrics','Pediatrics','PED',true,2),
    ('obstetrics-and-gynaecology','Obstetrics & Gynecology','OBG',true,3),
    ('psychiatry','Psychiatry','PSY',true,4),
    ('surgery','Surgery','SUR',true,5),
    ('nutrition','Nutrition','NUT',false,6)
  ) as disciplines(slug,name,code,primary_allowed,sort_order) loop
    insert into public.subjects(exam_id,slug,name,sort_order,active)
    values(step2_exam_id,item.slug,item.name,item.sort_order,true)
    on conflict (exam_id,slug) do update set
      name=excluded.name,sort_order=excluded.sort_order,active=true
    returning id into saved_id;
    insert into public.step2_discipline_catalog(subject_id,code,blueprint_name,primary_allowed)
    values(saved_id,item.code,item.name,item.primary_allowed)
    on conflict (subject_id) do update set
      code=excluded.code,blueprint_name=excluded.blueprint_name,
      primary_allowed=excluded.primary_allowed;
    insert into public.step2_discipline_aliases(alias,subject_id)
    values(item.name,saved_id)
    on conflict (alias) do update set subject_id=excluded.subject_id;
  end loop;

  for item in select * from (values
    ('social-sciences','Social Sciences: Legal/Ethical Issues & Professionalism/Systems-based Practice & Patient Safety','SOC',1),
    ('renal-urinary-and-reproductive','Renal & Urinary and Reproductive Systems','RUR',2),
    ('cardiovascular','Cardiovascular System','CVS',3),
    ('musculoskeletal-skin','Musculoskeletal System/Skin & Subcutaneous Tissue','MSK',4),
    ('behavioral-health','Behavioral Health','BEH',5),
    ('blood-lymphoreticular-immune','Blood & Lymphoreticular/Immune Systems','HEM',6),
    ('gastrointestinal','Gastrointestinal System','GIT',7),
    ('nervous-system','Nervous System & Special Senses','NRV',8),
    ('respiratory','Respiratory System','RES',9),
    ('multisystem-processes','Multisystem Processes & Disorders','MUL',10),
    ('endocrine','Endocrine System','END',11),
    ('pregnancy-and-childbirth','Pregnancy, Childbirth & the Puerperium','PRG',12),
    ('biostatistics-and-epidemiology','Biostatistics & Epidemiology/Population Health/Interpretation of Medical Literature','BST',13),
    ('human-development','Human Development','HDV',14)
  ) as systems(slug,name,code,sort_order) loop
    insert into public.categories(exam_id,slug,name,sort_order,active)
    values(step2_exam_id,item.slug,item.name,item.sort_order,true)
    on conflict (exam_id,slug) do update set
      name=excluded.name,sort_order=excluded.sort_order,active=true
    returning id into saved_id;
    insert into public.step2_system_catalog(category_id,code,blueprint_name)
    values(saved_id,item.code,item.name)
    on conflict (category_id) do update set
      code=excluded.code,blueprint_name=excluded.blueprint_name;
  end loop;

  insert into public.subject_categories(subject_id,category_id)
  select d.subject_id,s.category_id
  from public.step2_discipline_catalog d cross join public.step2_system_catalog s
  on conflict do nothing;
end $$;

revoke all on function public.setup_step2_question_taxonomy() from public;
select public.setup_step2_question_taxonomy();

create function public.step2_glossary_json(raw_glossary text)
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
        'term',btrim(substr(entry,1,separator-1)),
        'definition',btrim(substr(entry,separator+1))
      ));
    else
      result := result || jsonb_build_array(jsonb_build_object(
        'term',btrim(entry),'definition',''
      ));
    end if;
  end loop;
  return result;
end $$;

create function public.admin_import_step2_questions(payload jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := auth.uid();
  trusted_import boolean := coalesce(auth.jwt()->>'role','')='service_role';
  step2_exam_id uuid;
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
  select id into step2_exam_id from public.exams where code='step2ck' and active;
  if step2_exam_id is null then raise exception 'active Step 2 CK exam not found'; end if;

  for question_row in select value from jsonb_array_elements(payload->'questions') loop
    if question_row->>'targetExam' <> 'USMLE Step 2 CK' then
      raise exception 'targetExam must be USMLE Step 2 CK' using errcode='23514';
    end if;
    if coalesce(question_row->>'questionId','') !~ '^S2-[A-Z]{3}-[0-9]{4}$' then
      raise exception 'invalid Step 2 CK questionId: %',question_row->>'questionId' using errcode='23514';
    end if;
    if exists(select 1 from public.step2_question_details where question_code=question_row->>'questionId') then
      skipped_count := skipped_count+1;
      continue;
    end if;
    if nullif(btrim(question_row->>'batchId'),'') is null
       or length(btrim(question_row->>'stem')) not between 10 and 12000
       or nullif(btrim(question_row->>'topic'),'') is null
       or length(btrim(question_row->>'educationalObjective')) not between 10 and 4000
       or length(btrim(question_row->>'highYieldSummary')) not between 5 and 20000
       or length(btrim(question_row->>'imgNote')) > 10000
       or nullif(btrim(question_row->>'reviewerFlags'),'') is null then
      raise exception 'required Step 2 CK content is missing or too long for %',question_row->>'questionId' using errcode='23514';
    end if;
    if question_row->>'difficulty' not in ('easy','medium','hard') then
      raise exception 'invalid difficulty for %',question_row->>'questionId' using errcode='23514';
    end if;
    if question_row->>'reviewStatus' not in ('draft','queue','review','approved','revise','live') then
      raise exception 'invalid source reviewStatus for %',question_row->>'questionId' using errcode='23514';
    end if;
    if question_row->>'stem' ~* 'underlying (mechanism|pathophysiolog)|best explains the (mechanism|pathophysiolog)|mechanism of (this|the) (finding|abnormalit)' then
      raise exception 'mechanism/pathophysiology lead-in belongs to Step 1: %',question_row->>'questionId' using errcode='23514';
    end if;

    select c.id into system_id
    from public.categories c join public.step2_system_catalog sc on sc.category_id=c.id
    where c.exam_id=step2_exam_id and c.active
      and c.name=question_row->>'system' and sc.code=question_row->>'systemCode';
    if system_id is null then
      raise exception 'unknown Step 2 CK system/code for %',question_row->>'questionId' using errcode='23514';
    end if;
    if split_part(question_row->>'questionId','-',2) <> question_row->>'systemCode' then
      raise exception 'questionId system code mismatch for %',question_row->>'questionId' using errcode='23514';
    end if;

    select a.subject_id into primary_subject_id
    from public.step2_discipline_aliases a
    join public.step2_discipline_catalog d on d.subject_id=a.subject_id
    where a.alias=question_row->>'primaryDiscipline' and d.primary_allowed;
    if primary_subject_id is null then
      raise exception 'unknown primary Step 2 CK clinical science for %',question_row->>'questionId' using errcode='23514';
    end if;
    discipline_names := regexp_split_to_array(question_row->>'discipline','\s*;\s*');
    if cardinality(discipline_names) not between 1 and 6 then
      raise exception 'one or more Step 2 CK clinical-science tags are required for %',question_row->>'questionId' using errcode='23514';
    end if;
    if cardinality(discipline_names) <> cardinality(array(select distinct unnest(discipline_names))) then
      raise exception 'clinical-science tags must be unique for %',question_row->>'questionId' using errcode='23514';
    end if;
    if not exists(
      select 1 from unnest(discipline_names) n
      join public.step2_discipline_aliases a on a.alias=n
      where a.subject_id=primary_subject_id
    ) then raise exception 'primary clinical science must appear in discipline for %',question_row->>'questionId' using errcode='23514'; end if;
    if exists(
      select 1 from unnest(discipline_names) n
      left join public.step2_discipline_aliases a on a.alias=n
      where a.subject_id is null
    ) then raise exception 'unknown Step 2 CK clinical-science tag for %',question_row->>'questionId' using errcode='23514'; end if;

    select id into competency_id_value from public.step2_competencies
    where name=question_row->>'competency';
    if competency_id_value is null then
      raise exception 'unknown or 0%% Step 2 CK competency for %',question_row->>'questionId' using errcode='23514';
    end if;

    option_count := 0;
    normalized_options := array[]::text[];
    for option_index in 1..8 loop
      option_text_value := btrim(coalesce(question_row->>('opt'||option_index),''));
      explanation_value := btrim(coalesce(question_row->>('exp'||option_index),''));
      if option_text_value <> '' then
        if option_index <> option_count+1 or explanation_value='' then
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
      raise exception 'Step 2 CK questions require 4-8 unique options for %',question_row->>'questionId' using errcode='23514';
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
      step2_exam_id,btrim(question_row->>'stem'),btrim(question_row->>'educationalObjective'),
      correct_explanation,btrim(question_row->>'highYieldSummary'),nullif(btrim(question_row->>'imgNote'),''),
      public.step2_glossary_json(question_row->>'glossary'),
      (question_row->>'difficulty')::public.difficulty_level,'live',
      coalesce(array(select btrim(v) from unnest(regexp_split_to_array(question_row->>'keyInfo','\s*,\s*')) v where btrim(v)<>''),array[]::text[]),
      '[]'::jsonb,jsonb_build_array(btrim(question_row->>'reviewerFlags')),
      nullif(btrim(question_row->>'reviewerName'),''),now(),actor_id,actor_id,now(),
      question_row->>'questionId',3
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
      select subject_id into discipline_subject_id
      from public.step2_discipline_aliases where alias=discipline_name;
      insert into public.question_subjects(question_id,subject_id,question_exam_id,subject_exam_id)
      values(saved_question_id,discipline_subject_id,step2_exam_id,step2_exam_id);
    end loop;
    insert into public.question_categories(question_id,category_id,question_exam_id,category_exam_id)
    values(saved_question_id,system_id,step2_exam_id,step2_exam_id);

    insert into public.step2_question_details(
      question_id,question_code,batch_id,system_category_id,system_code,
      primary_discipline_id,competency_id,nutrition_tagged,topic,reviewer_flags,
      source_status,source_review_status,effective_review_status,demo_approval_override,
      approval_override_reason,reviewer_name,approved_date,drafted_date,notes,
      source_filename,original_payload,imported_by
    ) values (
      saved_question_id,question_row->>'questionId',btrim(question_row->>'batchId'),system_id,
      question_row->>'systemCode',primary_subject_id,competency_id_value,
      'Nutrition'=any(discipline_names),btrim(question_row->>'topic'),btrim(question_row->>'reviewerFlags'),
      btrim(question_row->>'sourceStatus'),question_row->>'reviewStatus','approved',true,
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

revoke all on function public.step2_glossary_json(text) from public;
revoke all on function public.admin_import_step2_questions(jsonb) from public;
grant execute on function public.admin_import_step2_questions(jsonb) to authenticated, service_role;

commit;
