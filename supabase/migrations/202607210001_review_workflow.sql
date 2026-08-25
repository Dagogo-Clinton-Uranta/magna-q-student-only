begin;
alter table public.review_events add column actor_role public.user_role;
create function public.assert_question_review_ready(target_question_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select count(*) from public.question_options where question_id = target_question_id) not between 2 and 8 then
    raise exception 'question must have between two and eight options' using errcode = '23514';
  end if;
  if (select count(*) from public.question_options where question_id = target_question_id and is_correct) <> 1 then
    raise exception 'question must have exactly one correct option' using errcode = '23514';
  end if;
  if (select jsonb_array_length(source_references) from public.questions where id = target_question_id) < 2 then
    raise exception 'question requires at least two source references' using errcode = '23514';
  end if;
  if not exists (select 1 from public.question_subjects where question_id = target_question_id) or
     not exists (select 1 from public.question_categories where question_id = target_question_id) then
    raise exception 'question requires subject and category assignments' using errcode = '23514';
  end if;
  if exists (select 1 from public.questions where id = target_question_id and
    (length(btrim(explanation)) < 20 or length(btrim(educational_objective)) < 10 or length(btrim(high_yield_summary)) < 5)) then
    raise exception 'question teaching content is incomplete' using errcode = '23514';
  end if;
end $$;
revoke all on function public.assert_question_review_ready(uuid) from public;
create function public.admin_assign_question(target_question_id uuid, target_reviewer_id uuid, assignment_note text default null)
returns void language plpgsql security definer set search_path = '' as $$
declare previous_status public.review_status; snapshot integer;
begin
  if public.current_user_role() <> 'admin' then raise exception 'administrator role required' using errcode = '42501'; end if;
  if not exists (select 1 from public.profiles where id = target_reviewer_id and role = 'reviewer') then
    raise exception 'reviewer profile not found' using errcode = '23503';
  end if;
  select status, version into previous_status, snapshot from public.questions where id = target_question_id for update;
  if previous_status not in ('draft','changes_requested','in_review') then raise exception 'question cannot be assigned in its current state' using errcode = '23514'; end if;
  perform public.assert_question_review_ready(target_question_id);
  update public.questions set reviewer_id = target_reviewer_id, status = 'in_review', version = version + 1 where id = target_question_id;
  insert into public.review_events(question_id, actor_id, actor_role, from_status, to_status, note, snapshot_version)
  values(target_question_id, auth.uid(), 'admin', previous_status, 'in_review', nullif(btrim(assignment_note),''), snapshot + 1);
end $$;
revoke all on function public.admin_assign_question(uuid,uuid,text) from public;
grant execute on function public.admin_assign_question(uuid,uuid,text) to authenticated;
create function public.reviewer_save_question(payload jsonb)
returns integer language plpgsql security definer set search_path = '' as $$
declare target_id uuid := (payload->>'id')::uuid; expected integer := (payload->>'expectedVersion')::integer; current_version integer; option_value jsonb;
begin
  if public.current_user_role() <> 'reviewer' then raise exception 'reviewer role required' using errcode = '42501'; end if;
  select version into current_version from public.questions where id = target_id and reviewer_id = auth.uid() and status = 'in_review' for update;
  if current_version is null then raise exception 'assigned question not found' using errcode = 'P0002'; end if;
  if current_version <> expected then raise exception 'question was changed by another editor' using errcode = '40001'; end if;
  if jsonb_typeof(payload->'options') <> 'array' or jsonb_array_length(payload->'options') not between 2 and 8 or
     (select count(*) from jsonb_array_elements(payload->'options') item where (item->>'isCorrect')::boolean) <> 1 then
    raise exception 'invalid answer options' using errcode = '23514';
  end if;
  update public.questions set stem = payload->>'stem', explanation = payload->>'explanation', educational_objective = payload->>'educationalObjective',
    high_yield_summary = payload->>'highYieldSummary', us_system_context_note = nullif(payload->>'usSystemContextNote',''),
    glossary = coalesce(payload->'glossary','[]'::jsonb), source_references = coalesce(payload->'sourceReferences','[]'::jsonb),
    accuracy_flags = coalesce(payload->'accuracyFlags','[]'::jsonb), reviewer_credit = nullif(payload->>'reviewerCredit',''), version = version + 1
  where id = target_id;
  delete from public.question_options where question_id = target_id;
  for option_value in select value from jsonb_array_elements(payload->'options') loop
    insert into public.question_options(question_id, option_text, is_correct, distractor_rationale, sort_order)
    values(target_id, option_value->>'optionText', (option_value->>'isCorrect')::boolean, nullif(option_value->>'distractorRationale',''), (option_value->>'sortOrder')::integer);
  end loop;
  return current_version + 1;
end $$;
revoke all on function public.reviewer_save_question(jsonb) from public;
grant execute on function public.reviewer_save_question(jsonb) to authenticated;
create function public.reviewer_add_comment(target_question_id uuid, target_field text, comment_text text)
returns uuid language plpgsql security definer set search_path = '' as $$
declare new_id uuid;
begin
  if public.current_user_role() <> 'reviewer' or not exists (select 1 from public.questions where id = target_question_id and reviewer_id = auth.uid() and status = 'in_review') then
    raise exception 'assigned reviewer required' using errcode = '42501';
  end if;
  if length(btrim(comment_text)) not between 2 and 4000 then raise exception 'invalid comment' using errcode = '22023'; end if;
  insert into public.question_review_comments(question_id, reviewer_id, field_name, comment) values(target_question_id, auth.uid(), nullif(btrim(target_field),''), btrim(comment_text)) returning id into new_id;
  return new_id;
end $$;
revoke all on function public.reviewer_add_comment(uuid,text,text) from public;
grant execute on function public.reviewer_add_comment(uuid,text,text) to authenticated;
create function public.reviewer_transition(target_question_id uuid, expected_version integer, decision text, decision_note text, credit text default null)
returns public.review_status language plpgsql security definer set search_path = '' as $$
declare current_version integer; next_status public.review_status;
begin
  if public.current_user_role() <> 'reviewer' then raise exception 'reviewer role required' using errcode = '42501'; end if;
  select version into current_version from public.questions where id = target_question_id and reviewer_id = auth.uid() and status = 'in_review' for update;
  if current_version is null then raise exception 'assigned question not found' using errcode = 'P0002'; end if;
  if current_version <> expected_version then raise exception 'question was changed by another editor' using errcode = '40001'; end if;
  if decision = 'approve' then
    perform public.assert_question_review_ready(target_question_id); next_status := 'physician_approved';
  elsif decision = 'request_changes' then
    if length(btrim(coalesce(decision_note,''))) < 5 then raise exception 'feedback is required' using errcode = '23514'; end if; next_status := 'changes_requested';
  else raise exception 'invalid review decision' using errcode = '22023'; end if;
  update public.questions set status = next_status, reviewed_at = case when next_status = 'physician_approved' then now() else reviewed_at end,
    reviewer_credit = coalesce(nullif(btrim(credit),''), reviewer_credit), version = version + 1 where id = target_question_id;
  insert into public.review_events(question_id, actor_id, actor_role, from_status, to_status, note, snapshot_version)
  values(target_question_id, auth.uid(), 'reviewer', 'in_review', next_status, nullif(btrim(decision_note),''), current_version + 1);
  return next_status;
end $$;
revoke all on function public.reviewer_transition(uuid,integer,text,text,text) from public;
grant execute on function public.reviewer_transition(uuid,integer,text,text,text) to authenticated;
create function public.admin_publish_question(target_question_id uuid, expected_version integer)
returns void language plpgsql security definer set search_path = '' as $$
declare current_version integer;
begin
  if public.current_user_role() <> 'admin' then raise exception 'administrator role required' using errcode = '42501'; end if;
  select version into current_version from public.questions where id = target_question_id and status = 'physician_approved' for update;
  if current_version is null then raise exception 'physician-approved question not found' using errcode = 'P0002'; end if;
  if current_version <> expected_version then raise exception 'question version changed' using errcode = '40001'; end if;
  perform public.assert_question_review_ready(target_question_id);
  if not exists (select 1 from public.review_events where question_id = target_question_id and to_status = 'physician_approved' and actor_role in ('reviewer','admin')) then
    raise exception 'physician approval event is required' using errcode = '23514';
  end if;
  update public.questions set status = 'live', published_by = auth.uid(), published_at = now(), version = version + 1 where id = target_question_id;
  insert into public.review_events(question_id, actor_id, actor_role, from_status, to_status, snapshot_version)
  values(target_question_id, auth.uid(), 'admin', 'physician_approved', 'live', current_version + 1);
end $$;
revoke all on function public.admin_publish_question(uuid,integer) from public;
grant execute on function public.admin_publish_question(uuid,integer) to authenticated;
create function public.admin_retire_question(target_question_id uuid, retirement_note text)
returns void language plpgsql security definer set search_path = '' as $$
declare previous_status public.review_status; current_version integer;
begin
  if public.current_user_role() <> 'admin' then raise exception 'administrator role required' using errcode = '42501'; end if;
  select status, version into previous_status, current_version from public.questions where id = target_question_id for update;
  if previous_status is null or previous_status = 'retired' then raise exception 'question cannot be retired' using errcode = '23514'; end if;
  update public.questions set status = 'retired', retired_at = now(), version = version + 1 where id = target_question_id;
  insert into public.review_events(question_id, actor_id, actor_role, from_status, to_status, note, snapshot_version)
  values(target_question_id, auth.uid(), 'admin', previous_status, 'retired', nullif(btrim(retirement_note),''), current_version + 1);
end $$;
revoke all on function public.admin_retire_question(uuid,text) from public;
grant execute on function public.admin_retire_question(uuid,text) to authenticated;
commit;
