begin;

create function public.student_get_block_question(target_block_id uuid, target_position integer)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare b public.test_blocks; bq public.test_block_questions; q public.questions; result jsonb; reveal boolean;
begin
  select * into b from public.test_blocks where id = target_block_id and user_id = auth.uid();
  if b.id is null then raise exception 'block not found' using errcode = 'P0002'; end if;
  if b.status in ('completed','abandoned') then raise exception 'active block required' using errcode = '23514'; end if;
  select * into bq from public.test_block_questions where block_id = target_block_id and position = target_position;
  if bq.id is null then raise exception 'question position not found' using errcode = 'P0002'; end if;
  select * into q from public.questions where id = bq.question_id and status = 'live';
  if q.id is null then raise exception 'live question unavailable' using errcode = 'P0002'; end if;
  update public.test_blocks set current_position = target_position, last_activity_at = now(), status = case when status = 'created' then 'in_progress' else status end,
    started_at = coalesce(started_at, now()) where id = target_block_id;
  update public.test_block_questions set first_viewed_at = coalesce(first_viewed_at, now()) where id = bq.id;
  reveal := b.mode = 'tutor' and bq.answered_at is not null;
  result := jsonb_build_object(
    'blockId', b.id, 'mode', b.mode, 'status', b.status, 'position', bq.position, 'total', b.actual_question_count,
    'questionId', q.id, 'stem', q.stem, 'imagePath', q.image_path, 'marked', bq.marked,
    'selectedOptionId', bq.selected_option_id, 'answered', bq.answered_at is not null,
    'options', (select jsonb_agg(jsonb_build_object('id',o.id,'text',o.option_text) order by ordinality)
      from jsonb_array_elements_text(bq.option_order) with ordinality arranged(option_id, ordinality)
      join public.question_options o on o.id = arranged.option_id::uuid),
    'navigator', (select jsonb_agg(jsonb_build_object('position',x.position,'answered',x.answered_at is not null,'marked',x.marked) order by x.position)
      from public.test_block_questions x where x.block_id = b.id)
  );
  if reveal then
    result := result || jsonb_build_object(
      'isCorrect', bq.is_correct, 'correctOptionId', (select id from public.question_options where question_id = q.id and is_correct),
      'explanation', q.explanation, 'educationalObjective', q.educational_objective, 'highYieldSummary', q.high_yield_summary,
      'usSystemContextNote', q.us_system_context_note, 'glossary', q.glossary,
      'rationales', (select jsonb_object_agg(id::text, coalesce(distractor_rationale,'')) from public.question_options where question_id = q.id),
      'peerPctCorrect', (select case when attempts >= 5 then pct_correct else null end from public.question_stats where question_id = q.id)
    );
  end if;
  return result;
end $$;
revoke all on function public.student_get_block_question(uuid,integer) from public;
grant execute on function public.student_get_block_question(uuid,integer) to authenticated;

create function public.student_submit_answer(target_block_id uuid, target_position integer, chosen_option_id uuid, submission_id uuid, reported_time_ms integer)
returns jsonb language plpgsql volatile security definer set search_path = '' as $$
declare b public.test_blocks; bq public.test_block_questions; correct boolean; existing public.answer_logs; safe_time integer;
begin
  select * into existing from public.answer_logs where user_id = auth.uid() and submission_key = submission_id;
  if existing.id is not null then return public.student_get_block_question(target_block_id, target_position); end if;
  select * into b from public.test_blocks where id = target_block_id and user_id = auth.uid() for update;
  if b.id is null then raise exception 'block not found' using errcode = 'P0002'; end if;
  if b.status not in ('created','in_progress') then raise exception 'block does not accept answers' using errcode = '23514'; end if;
  select * into bq from public.test_block_questions where block_id = b.id and position = target_position for update;
  if bq.id is null then raise exception 'question is not in block' using errcode = 'P0002'; end if;
  if bq.answered_at is not null then raise exception 'question already answered' using errcode = '23505'; end if;
  if not exists (select 1 from public.question_options where id = chosen_option_id and question_id = bq.question_id) then
    raise exception 'selected option does not belong to question' using errcode = '23514';
  end if;
  select is_correct into correct from public.question_options where id = chosen_option_id;
  safe_time := least(greatest(coalesce(reported_time_ms,0),0), 7200000);
  update public.test_block_questions set selected_option_id = chosen_option_id, is_correct = correct, answered_at = now(),
    time_spent_ms = safe_time, answer_submission_key = submission_id where id = bq.id;
  update public.test_blocks set status = 'in_progress', started_at = coalesce(started_at,now()), last_activity_at = now() where id = b.id;
  insert into public.answer_logs(user_id,block_id,block_question_id,question_id,selected_option_id,is_correct,time_spent_ms,mode,submission_key)
  values(auth.uid(),b.id,bq.id,bq.question_id,chosen_option_id,correct,safe_time,b.mode,submission_id);
  insert into public.question_stats(question_id,attempts,correct_count,avg_time_ms,last_calculated_at)
  values(bq.question_id,1,case when correct then 1 else 0 end,safe_time,now())
  on conflict(question_id) do update set attempts=public.question_stats.attempts+1,
    correct_count=public.question_stats.correct_count+case when correct then 1 else 0 end,
    avg_time_ms=((coalesce(public.question_stats.avg_time_ms,0)*public.question_stats.attempts)+safe_time)/(public.question_stats.attempts+1), last_calculated_at=now();
  return public.student_get_block_question(target_block_id,target_position);
end $$;
revoke all on function public.student_submit_answer(uuid,integer,uuid,uuid,integer) from public;
grant execute on function public.student_submit_answer(uuid,integer,uuid,uuid,integer) to authenticated;

create function public.student_set_mark(target_block_id uuid, target_position integer, should_mark boolean)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare target_question uuid;
begin
  select bq.question_id into target_question from public.test_block_questions bq join public.test_blocks b on b.id=bq.block_id
  where b.id=target_block_id and b.user_id=auth.uid() and bq.position=target_position;
  if target_question is null then raise exception 'block question not found' using errcode='P0002'; end if;
  update public.test_block_questions set marked=should_mark where block_id=target_block_id and position=target_position;
  if should_mark then insert into public.user_question_marks(user_id,question_id) values(auth.uid(),target_question) on conflict(user_id,question_id) do update set marked_at=now();
  else delete from public.user_question_marks where user_id=auth.uid() and question_id=target_question; end if;
end $$;
revoke all on function public.student_set_mark(uuid,integer,boolean) from public;
grant execute on function public.student_set_mark(uuid,integer,boolean) to authenticated;

create function public.student_save_note(target_question_id uuid, note_content text)
returns void language plpgsql volatile security definer set search_path = '' as $$
begin
  if length(note_content)>10000 or not exists(select 1 from public.test_block_questions bq join public.test_blocks b on b.id=bq.block_id where b.user_id=auth.uid() and bq.question_id=target_question_id) then
    raise exception 'invalid note target or content' using errcode='23514'; end if;
  if length(btrim(note_content))=0 then delete from public.user_question_notes where user_id=auth.uid() and question_id=target_question_id;
  else insert into public.user_question_notes(user_id,question_id,note_text) values(auth.uid(),target_question_id,note_content)
    on conflict(user_id,question_id) do update set note_text=excluded.note_text; end if;
end $$;
revoke all on function public.student_save_note(uuid,text) from public;
grant execute on function public.student_save_note(uuid,text) to authenticated;

commit;
