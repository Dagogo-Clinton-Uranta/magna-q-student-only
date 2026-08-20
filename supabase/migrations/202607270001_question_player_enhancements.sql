begin;

alter table public.questions
add column key_phrases text[] not null default array[]::text[];

alter table public.questions
add constraint questions_key_phrases_count_check
check (cardinality(key_phrases) <= 50);

alter table public.question_options
add column explanation text not null default '';

update public.question_options o
set explanation = case
  when o.is_correct then q.explanation
  else coalesce(
    nullif(o.distractor_rationale, ''),
    'This option does not best fit the findings in the question.'
  )
end
from public.questions q
where q.id = o.question_id;

update public.questions
set key_phrases = case
  when import_key like '%-1' then array['wheeze', 'urticaria', 'hypotension', 'groundnuts']
  when import_key like '%-2' then array['screening test', 'sensitivity']
  when import_key like '%-3' then array['crushing central chest pain', 'ST elevation']
  when import_key like '%-4' then array['tearing chest pain', 'unequal arm blood pressures']
  when import_key like '%-5' then array['flexural eczema', 'chronic relapsing course']
  when import_key like '%-6' then array['ear pain', 'bulging, opaque tympanic membrane']
  when import_key like '%-7' then array['ketones', 'high anion-gap acidosis', 'deep breathing']
  when import_key like '%-8' then array['pregnant', 'abnormal oral glucose tolerance test']
  when import_key like '%-9' then array['painless breast lump']
  when import_key like '%-10' then array['right upper-quadrant pain', 'positive Murphy sign']
  when import_key like '%-11' then array['chronic diarrhea', 'poor growth', 'iron deficiency']
  when import_key like '%-12' then array['genetically identical daughter cells']
  when import_key like '%-13' then array['low mean cell volume', 'low ferritin']
  when import_key like '%-14' then array['chemotherapy', 'fever', 'very low neutrophil count']
  when import_key like '%-15' then array['fever', 'neck stiffness', 'altered mental status']
  when import_key like '%-16' then array['vertical transmission', 'antenatal screening']
  when import_key like '%-17' then array['sudden severe unilateral scrotal pain', 'high-riding testis']
  when import_key like '%-18' then array['sudden facial droop', 'arm weakness', 'speech difficulty']
  when import_key like '%-19' then array['generalized convulsion', 'longer than five minutes']
  when import_key like '%-20' then array['painful loss of vision', 'fixed mid-dilated pupil']
  when import_key like '%-21' then array['pinpoint pupils', 'respiratory depression']
  when import_key like '%-22' then array['hypertension', 'proteinuria', 'visual symptoms']
  when import_key like '%-23' then array['heavy bleeding', 'soft enlarged uterus']
  when import_key like '%-24' then array['persistent low mood', 'loss of interest', 'four weeks']
  when import_key like '%-25' then array['suicidal thoughts', 'specific plan', 'access to means']
  when import_key like '%-26' then array['cannot complete sentences', 'low oxygen saturation']
  when import_key like '%-27' then array['unilateral absent breath sounds', 'hypotension']
  when import_key like '%-28' then array['heavy proteinuria', 'low serum albumin', 'hyperlipidemia']
  when import_key like '%-29' then array['hot swollen knee', 'pain on passive movement']
  when import_key like '%-30' then array['competent adult', 'refuses', 'risks and alternatives']
  else key_phrases
end
where import_key like 'create-test-sample-%';

create or replace function public.enforce_block_answer_deadline()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  b public.test_blocks;
  effective_elapsed integer;
begin
  if new.selected_option_id is null or old.selected_option_id is not null then
    return new;
  end if;
  select * into b from public.test_blocks where id = new.block_id;
  if b.mode = 'timed' then
    effective_elapsed := b.elapsed_seconds + case
      when b.started_at is null then 0
      else greatest(0, extract(epoch from (now() - b.started_at))::integer)
    end;
    if b.status not in ('created', 'in_progress')
       or effective_elapsed >= b.time_limit_seconds
       or (
         old.first_viewed_at is not null
         and now() >= old.first_viewed_at + interval '90 seconds'
       ) then
      raise exception 'timed question deadline has passed' using errcode = '23514';
    end if;
  end if;
  return new;
end $$;

create or replace function public.student_get_block_question(
  target_block_id uuid,
  target_position integer
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
declare
  b public.test_blocks;
  bq public.test_block_questions;
  q public.questions;
  result jsonb;
  reveal boolean;
  viewed_at timestamptz;
begin
  select * into b
  from public.test_blocks
  where id = target_block_id and user_id = auth.uid();
  if b.id is null then
    raise exception 'block not found' using errcode = 'P0002';
  end if;
  if b.status in ('completed', 'abandoned') then
    raise exception 'active block required' using errcode = '23514';
  end if;

  select * into bq
  from public.test_block_questions
  where block_id = target_block_id and position = target_position;
  if bq.id is null then
    raise exception 'question position not found' using errcode = 'P0002';
  end if;

  select * into q
  from public.questions
  where id = bq.question_id and status = 'live';
  if q.id is null then
    raise exception 'live question unavailable' using errcode = 'P0002';
  end if;

  update public.test_blocks
  set
    current_position = target_position,
    last_activity_at = now(),
    status = case when status = 'created' then 'in_progress' else status end,
    started_at = coalesce(started_at, now())
  where id = target_block_id;

  viewed_at := coalesce(bq.first_viewed_at, now());
  update public.test_block_questions
  set first_viewed_at = viewed_at
  where id = bq.id;

  reveal := b.mode = 'tutor' and bq.answered_at is not null;
  result := jsonb_build_object(
    'blockId', b.id,
    'mode', b.mode,
    'status', b.status,
    'position', bq.position,
    'total', b.actual_question_count,
    'questionId', q.id,
    'stem', q.stem,
    'imagePath', q.image_path,
    'keyPhrases', q.key_phrases,
    'marked', exists (
      select 1
      from public.user_question_marks m
      where m.user_id = auth.uid() and m.question_id = q.id
    ),
    'privateNote', coalesce((
      select n.note_text
      from public.user_question_notes n
      where n.user_id = auth.uid() and n.question_id = q.id
    ), ''),
    'selectedOptionId', bq.selected_option_id,
    'answered', bq.answered_at is not null,
    'questionRemainingSeconds', case
      when b.mode = 'timed' and bq.answered_at is null
        then greatest(0, 90 - floor(extract(epoch from (now() - viewed_at)))::integer)
      else null
    end,
    'options', (
      select jsonb_agg(
        jsonb_build_object('id', o.id, 'text', o.option_text)
        order by arranged.ordinality
      )
      from jsonb_array_elements_text(bq.option_order)
        with ordinality arranged(option_id, ordinality)
      join public.question_options o on o.id = arranged.option_id::uuid
    ),
    'navigator', (
      select jsonb_agg(
        jsonb_build_object(
          'position', x.position,
          'answered', x.answered_at is not null,
          'marked', exists (
            select 1
            from public.user_question_marks m
            where m.user_id = auth.uid() and m.question_id = x.question_id
          )
        )
        order by x.position
      )
      from public.test_block_questions x
      where x.block_id = b.id
    )
  );

  if reveal then
    result := result || jsonb_build_object(
      'isCorrect', bq.is_correct,
      'correctOptionId', (
        select id
        from public.question_options
        where question_id = q.id and is_correct
      ),
      'explanation', q.explanation,
      'educationalObjective', q.educational_objective,
      'highYieldSummary', q.high_yield_summary,
      'usSystemContextNote', q.us_system_context_note,
      'glossary', q.glossary,
      'rationales', (
        select jsonb_object_agg(
          id::text,
          coalesce(nullif(explanation, ''), distractor_rationale, '')
        )
        from public.question_options
        where question_id = q.id
      ),
      'optionStats', (
        select coalesce(
          jsonb_object_agg(
            o.id::text,
            case
              when totals.attempts = 0 then 0
              else round(coalesce(choices.attempts, 0) * 100.0 / totals.attempts, 1)
            end
          ),
          '{}'::jsonb
        )
        from public.question_options o
        cross join lateral (
          select count(*) as attempts
          from public.answer_logs a
          where a.question_id = q.id
        ) totals
        left join lateral (
          select count(*) as attempts
          from public.answer_logs a
          where a.question_id = q.id and a.selected_option_id = o.id
        ) choices on true
        where o.question_id = q.id
      ),
      'responseCount', (
        select count(*)
        from public.answer_logs a
        where a.question_id = q.id
      ),
      'peerPctCorrect', (
        select case when attempts >= 5 then pct_correct else null end
        from public.question_stats
        where question_id = q.id
      )
    );
  end if;
  return result;
end $$;

revoke all on function public.student_get_block_question(uuid, integer) from public;
grant execute on function public.student_get_block_question(uuid, integer) to authenticated;

commit;
