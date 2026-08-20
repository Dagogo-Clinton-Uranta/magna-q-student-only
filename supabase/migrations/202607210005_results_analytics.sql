begin;

create function public.student_block_results(target_block_id uuid) returns jsonb language plpgsql stable security definer set search_path='' as $$
declare b public.test_blocks; total integer; answered integer; correct_count integer; marked_count integer;
begin
  select * into b from public.test_blocks where id=target_block_id and user_id=auth.uid() and status='completed';
  if b.id is null then raise exception 'completed block not found' using errcode='P0002'; end if;
  select count(*),count(*) filter(where answered_at is not null),count(*) filter(where is_correct),count(*) filter(where marked)
  into total,answered,correct_count,marked_count from public.test_block_questions where block_id=b.id;
  return jsonb_build_object(
    'blockId',b.id,'mode',b.mode,'completedAt',b.completed_at,
    'summary',jsonb_build_object('total',total,'answered',answered,'correct',correct_count,'incorrect',answered-correct_count,
      'unanswered',total-answered,'scorePct',case when total=0 then 0 else round(correct_count*100.0/total,1) end,
      'totalTimeSeconds',b.elapsed_seconds,'averageTimeMs',coalesce((select round(avg(time_spent_ms)) from public.test_block_questions where block_id=b.id and answered_at is not null),0),'marked',marked_count),
    'questions',(select jsonb_agg(jsonb_build_object(
      'position',bq.position,'questionId',q.id,'stem',q.stem,'selectedOptionId',bq.selected_option_id,
      'selectedOptionText',(select option_text from public.question_options where id=bq.selected_option_id),
      'correctOptionId',(select id from public.question_options where question_id=q.id and is_correct),
      'correctOptionText',(select option_text from public.question_options where question_id=q.id and is_correct),
      'isCorrect',bq.is_correct,'answered',bq.answered_at is not null,'marked',bq.marked,'timeSpentMs',bq.time_spent_ms,
      'explanation',q.explanation,'educationalObjective',q.educational_objective,'highYieldSummary',q.high_yield_summary,
      'usSystemContextNote',q.us_system_context_note,'glossary',q.glossary,
      'rationales',(select jsonb_object_agg(id::text,coalesce(distractor_rationale,'')) from public.question_options where question_id=q.id),
      'peerPctCorrect',(select case when attempts>=5 then pct_correct else null end from public.question_stats where question_id=q.id)
      ,'privateNote',(select note_text from public.user_question_notes where user_id=auth.uid() and question_id=q.id)
    ) order by bq.position) from public.test_block_questions bq join public.questions q on q.id=bq.question_id where bq.block_id=b.id),
    'subjects',(select coalesce(jsonb_agg(row_to_json(performance)), '[]'::jsonb) from (
      select s.name,count(*) total,count(*) filter(where bq.is_correct) correct,
        round(count(*) filter(where bq.is_correct)*100.0/nullif(count(*),0),1) score_pct
      from public.test_block_questions bq join public.question_subjects qs on qs.question_id=bq.question_id join public.subjects s on s.id=qs.subject_id
      where bq.block_id=b.id group by s.id,s.name order by s.name) performance),
    'categories',(select coalesce(jsonb_agg(row_to_json(performance)), '[]'::jsonb) from (
      select c.name,count(*) total,count(*) filter(where bq.is_correct) correct,
        round(count(*) filter(where bq.is_correct)*100.0/nullif(count(*),0),1) score_pct
      from public.test_block_questions bq join public.question_categories qc on qc.question_id=bq.question_id join public.categories c on c.id=qc.category_id
      where bq.block_id=b.id group by c.id,c.name order by c.name) performance)
  );
end $$;
revoke all on function public.student_block_results(uuid) from public;grant execute on function public.student_block_results(uuid) to authenticated;

create function public.student_dashboard_summary() returns jsonb language sql stable security definer set search_path='' as $$
  select jsonb_build_object(
    'totalAnswered',(select count(*) from public.answer_logs where user_id=auth.uid()),
    'overallPctCorrect',(select case when count(*)=0 then null else round(count(*) filter(where is_correct)*100.0/count(*),1) end from public.answer_logs where user_id=auth.uid()),
    'markedCount',(select count(*) from public.user_question_marks where user_id=auth.uid()),
    'recentBlocks',(select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (select id,mode,status,actual_question_count,created_at,completed_at from public.test_blocks where user_id=auth.uid() order by created_at desc limit 10)x),
    'recentIncorrect',(select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (select distinct on(a.question_id) a.question_id,q.stem,a.answered_at from public.answer_logs a join public.questions q on q.id=a.question_id where a.user_id=auth.uid() and not a.is_correct order by a.question_id,a.answered_at desc limit 5)x),
    'subjects',(select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (select s.name,count(*) attempts,count(*) filter(where a.is_correct) correct from public.answer_logs a join public.question_subjects qs on qs.question_id=a.question_id join public.subjects s on s.id=qs.subject_id where a.user_id=auth.uid() group by s.id,s.name order by count(*) desc)x),
    'categories',(select coalesce(jsonb_agg(row_to_json(x)),'[]'::jsonb) from (select c.name,count(*) attempts,count(*) filter(where a.is_correct) correct from public.answer_logs a join public.question_categories qc on qc.question_id=a.question_id join public.categories c on c.id=qc.category_id where a.user_id=auth.uid() group by c.id,c.name order by count(*) desc)x)
  )
$$;
revoke all on function public.student_dashboard_summary() from public;grant execute on function public.student_dashboard_summary() to authenticated;

commit;
