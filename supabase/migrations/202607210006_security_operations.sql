begin;
create table public.api_rate_limits(key_hash text primary key,window_started_at timestamptz not null,count integer not null check(count>0));
alter table public.api_rate_limits enable row level security;
create function public.consume_rate_limit(raw_key text,maximum integer,window_seconds integer) returns boolean language plpgsql volatile security definer set search_path='' as $$
declare hashed text:=encode(extensions.digest(raw_key,'sha256'),'hex');allowed boolean;
begin
if maximum not between 1 and 10000 or window_seconds not between 1 and 86400 then raise exception 'invalid rate limit configuration';end if;
insert into public.api_rate_limits(key_hash,window_started_at,count) values(hashed,now(),1) on conflict(key_hash) do update set window_started_at=case when public.api_rate_limits.window_started_at+make_interval(secs=>window_seconds)<=now() then now() else public.api_rate_limits.window_started_at end,count=case when public.api_rate_limits.window_started_at+make_interval(secs=>window_seconds)<=now() then 1 else public.api_rate_limits.count+1 end returning count<=maximum into allowed;return allowed;end $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public;grant execute on function public.consume_rate_limit(text,integer,integer) to authenticated;
create index review_queue_exam_idx on public.questions(reviewer_id,status,exam_id,updated_at);create index block_questions_question_idx on public.test_block_questions(question_id);create index notes_user_updated_idx on public.user_question_notes(user_id,updated_at desc);
commit;
