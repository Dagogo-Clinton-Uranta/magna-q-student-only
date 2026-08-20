begin;

create table public.student_feedback (
  id uuid primary key default extensions.gen_random_uuid(),
  subject text not null
    check (char_length(btrim(subject)) between 3 and 160),
  feedback_text text not null
    check (char_length(btrim(feedback_text)) between 10 and 5000),
  location text not null
    check (location ~ '^[A-Z]{2}$'),
  created_at timestamptz not null default now()
);

comment on table public.student_feedback is
  'Anonymous product suggestions. The submitting profile ID is intentionally not stored.';
comment on column public.student_feedback.location is
  'Country-of-residence code copied from the submitting profile at submission time.';

create index student_feedback_created_at_idx
  on public.student_feedback (created_at desc);

alter table public.student_feedback enable row level security;

create policy student_feedback_admin_read
  on public.student_feedback
  for select
  to authenticated
  using (public.current_user_role() = 'admin');

grant select on public.student_feedback to authenticated;

create function public.submit_student_feedback(
  p_subject text,
  p_feedback_text text
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  feedback_id uuid;
  profile_location text;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select country_code
  into profile_location
  from public.profiles
  where id = auth.uid()
    and onboarding_completed;

  if not found then
    raise exception 'completed profile required' using errcode = '42501';
  end if;

  insert into public.student_feedback (subject, feedback_text, location)
  values (btrim(p_subject), btrim(p_feedback_text), profile_location)
  returning id into feedback_id;

  return feedback_id;
end;
$$;

revoke all on function public.submit_student_feedback(text, text) from public;
grant execute on function public.submit_student_feedback(text, text)
  to authenticated;

commit;
