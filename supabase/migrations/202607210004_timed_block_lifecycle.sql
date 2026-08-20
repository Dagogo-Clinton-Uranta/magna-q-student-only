begin;

create function public.enforce_block_answer_deadline() returns trigger language plpgsql security definer set search_path='' as $$
declare b public.test_blocks; effective_elapsed integer;
begin
  if new.selected_option_id is null or old.selected_option_id is not null then return new; end if;
  select * into b from public.test_blocks where id=new.block_id;
  if b.mode='timed' then
    effective_elapsed := b.elapsed_seconds + case when b.started_at is null then 0 else greatest(0,extract(epoch from (now()-b.started_at))::integer) end;
    if b.status not in ('created','in_progress') or effective_elapsed >= b.time_limit_seconds then
      raise exception 'timed block deadline has passed' using errcode='23514';
    end if;
  end if;
  return new;
end $$;
create trigger block_answer_deadline before update of selected_option_id on public.test_block_questions
for each row execute function public.enforce_block_answer_deadline();

create function public.student_suspend_block(target_block_id uuid) returns void language plpgsql volatile security definer set search_path='' as $$
declare b public.test_blocks; added integer;
begin
  select * into b from public.test_blocks where id=target_block_id and user_id=auth.uid() for update;
  if b.id is null then raise exception 'block not found' using errcode='P0002'; end if;
  if b.status not in ('created','in_progress') then raise exception 'block cannot be suspended' using errcode='23514'; end if;
  added := case when b.started_at is null then 0 else greatest(0,extract(epoch from (now()-b.started_at))::integer) end;
  update public.test_blocks set status='suspended',elapsed_seconds=least(coalesce(time_limit_seconds,2147483647),elapsed_seconds+added),
    started_at=null,suspended_at=now(),last_activity_at=now() where id=target_block_id;
end $$;
revoke all on function public.student_suspend_block(uuid) from public; grant execute on function public.student_suspend_block(uuid) to authenticated;

create function public.student_resume_block(target_block_id uuid) returns void language plpgsql volatile security definer set search_path='' as $$
declare b public.test_blocks;
begin
  select * into b from public.test_blocks where id=target_block_id and user_id=auth.uid() for update;
  if b.id is null then raise exception 'block not found' using errcode='P0002'; end if;
  if b.status<>'suspended' then raise exception 'block is not suspended' using errcode='23514'; end if;
  if b.mode='timed' and b.elapsed_seconds>=b.time_limit_seconds then
    update public.test_blocks set status='completed',completed_at=now() where id=target_block_id; return;
  end if;
  update public.test_blocks set status='in_progress',started_at=now(),suspended_at=null,last_activity_at=now() where id=target_block_id;
end $$;
revoke all on function public.student_resume_block(uuid) from public; grant execute on function public.student_resume_block(uuid) to authenticated;

create function public.student_complete_block(target_block_id uuid) returns void language plpgsql volatile security definer set search_path='' as $$
declare b public.test_blocks; added integer;
begin
  select * into b from public.test_blocks where id=target_block_id and user_id=auth.uid() for update;
  if b.id is null then raise exception 'block not found' using errcode='P0002'; end if;
  if b.status='completed' then return; end if;
  if b.status not in ('created','in_progress','suspended') then raise exception 'block cannot be completed' using errcode='23514'; end if;
  added := case when b.status='in_progress' and b.started_at is not null then greatest(0,extract(epoch from (now()-b.started_at))::integer) else 0 end;
  update public.test_blocks set status='completed',elapsed_seconds=least(coalesce(time_limit_seconds,2147483647),elapsed_seconds+added),
    completed_at=now(),last_activity_at=now(),started_at=null,suspended_at=null where id=target_block_id;
end $$;
revoke all on function public.student_complete_block(uuid) from public; grant execute on function public.student_complete_block(uuid) to authenticated;

commit;
