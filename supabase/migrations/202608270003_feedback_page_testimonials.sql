begin;

alter table public.testimonials
  drop constraint testimonials_source_check,
  drop constraint testimonials_check;

alter table public.testimonials
  add constraint testimonials_source_check
    check (source in ('stage_change', 'feedback_page')),
  add constraint testimonials_stage_context_check check (
    (source = 'stage_change' and from_stage <> to_stage)
    or (source = 'feedback_page' and from_stage = to_stage)
  );

comment on table public.testimonials is
  'Attributable student reviews submitted after a stage change or directly from the feedback page.';
comment on column public.testimonials.source is
  'Where the review was requested: stage_change or feedback_page.';

create function public.submit_feedback_testimonial(
  p_comment text,
  p_rating numeric,
  p_found_useful boolean,
  p_would_recommend boolean
) returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_record public.profiles;
  testimonial_id uuid;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select *
  into profile_record
  from public.profiles
  where id = auth.uid()
    and onboarding_completed;

  if profile_record.id is null then
    raise exception 'completed profile required' using errcode = '42501';
  end if;

  insert into public.testimonials (
    user_id,
    user_name,
    username,
    from_stage,
    to_stage,
    comment,
    rating,
    found_useful,
    would_recommend,
    source
  ) values (
    profile_record.id,
    profile_record.full_name,
    profile_record.username,
    profile_record.study_stage,
    profile_record.study_stage,
    btrim(p_comment),
    p_rating,
    p_found_useful,
    p_would_recommend,
    'feedback_page'
  )
  returning id into testimonial_id;

  return testimonial_id;
end;
$$;

revoke all on function public.submit_feedback_testimonial(
  text,
  numeric,
  boolean,
  boolean
) from public;
grant execute on function public.submit_feedback_testimonial(
  text,
  numeric,
  boolean,
  boolean
) to authenticated;

commit;
