begin;

create or replace function public.student_get_block_question_billing_impl(
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
              when coalesce(qs.attempts, 0) = 0 then 0
              else round(coalesce(choice_counts.attempts, 0) * 100.0 / qs.attempts, 1)
            end
          ),
          '{}'::jsonb
        )
        from public.question_options o
        left join (
          select selected_option_id, count(*) as attempts
          from public.answer_logs
          where question_id = q.id
          group by selected_option_id
        ) choice_counts on choice_counts.selected_option_id = o.id
        left join public.question_stats qs on qs.question_id = q.id
        where o.question_id = q.id
      ),
      'responseCount', coalesce((
        select attempts
        from public.question_stats
        where question_id = q.id
      ), 0),
      'peerPctCorrect', (
        select case when attempts >= 5 then pct_correct else null end
        from public.question_stats
        where question_id = q.id
      )
    );
  end if;
  return result;
end $$;

revoke all on function public.student_get_block_question_billing_impl(uuid, integer) from public, authenticated;

create index if not exists answer_logs_question_option_idx
  on public.answer_logs(question_id, selected_option_id);

commit;
