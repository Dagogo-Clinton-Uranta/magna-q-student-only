begin;
alter table public.residency_events
  alter column event_date drop not null,
  add column published_timing text,
  add column listed_institution_name text,
  add column listed_specialty text,
  add column listed_acgme_id varchar(30);
comment on column public.residency_events.published_timing is
  'Source-published schedule wording when an exact event date is unavailable.';
comment on column public.residency_events.listed_institution_name is
  'Institution or host label supplied by the source, retained even when no residency-directory record matches.';
comment on column public.residency_events.listed_specialty is
  'Specialty supplied by the event source, retained independently of residency-directory linkage.';
comment on column public.residency_events.listed_acgme_id is
  'Optional source-supplied ACGME ID; it may be absent or may not match the current residency directory.';
drop index public.residency_events_identity_idx;
create unique index residency_events_identity_idx
on public.residency_events(event_name, event_date, source_url)
nulls not distinct;
comment on index public.residency_events_identity_idx is
  'Idempotent import identity, including undated events where event_date is null.';
drop view public.residency_event_directory;
create view public.residency_event_directory
with (security_invoker = true)
as
select
  event.*,
  coalesce(
    array_agg(distinct program.id) filter (where program.id is not null),
    '{}'::uuid[]
  ) as program_ids,
  case
    when count(program.id) filter (where program.id is not null) > 0 then
      coalesce(
        array_agg(distinct program.program_name order by program.program_name)
          filter (where program.program_name is not null),
        '{}'::text[]
      )
    when event.listed_institution_name is not null then
      array[event.listed_institution_name]
    else '{}'::text[]
  end as institution_names,
  case
    when count(program.id) filter (where program.id is not null) > 0 then
      coalesce(
        array_agg(distinct program.specialty order by program.specialty)
          filter (where program.specialty is not null),
        '{}'::text[]
      )
    when event.listed_specialty is not null then array[event.listed_specialty]
    else '{}'::text[]
  end as specialties,
  case
    when count(program.id) filter (where program.id is not null) > 0 then
      coalesce(
        array_agg(distinct program.acgme_id order by program.acgme_id)
          filter (where program.acgme_id is not null),
        '{}'::text[]
      )
    when event.listed_acgme_id is not null then array[event.listed_acgme_id::text]
    else '{}'::text[]
  end as acgme_ids,
  coalesce(
    array_agg(distinct program.city order by program.city)
      filter (where program.city is not null),
    '{}'::text[]
  ) as cities,
  coalesce(
    array_agg(distinct program.state order by program.state)
      filter (where program.state is not null),
    '{}'::text[]
  ) as states,
  coalesce(
    array_agg(distinct program.state || '|' || program.city)
      filter (where program.state is not null and program.city is not null),
    '{}'::text[]
  ) as location_keys,
  case
    when count(program.id) filter (where program.id is not null) > 0 then
      coalesce(
        array_agg(distinct program.id::text order by program.id::text)
          filter (where program.id is not null),
        '{}'::text[]
      )
    when event.listed_institution_name is not null then
      array['name:' || lower(event.listed_institution_name)]
    else '{}'::text[]
  end as institution_keys
from public.residency_events as event
left join public.residency_event_programs as link on link.event_id = event.id
left join public.residency_programs as program on program.id = link.residency_program_id
group by event.id;
comment on view public.residency_event_directory is
  'One row per event, with source-provided institution data used when a residency-directory link is absent.';
grant select on public.residency_event_directory to authenticated;
create or replace function public.get_residency_event_filter_options()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'institutions', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object('label', options.label, 'value', options.value)
          order by options.label
        )
        from (
          select distinct raw_options.label, raw_options.value
          from (
            select program.program_name as label, program.id::text as value
            from public.residency_programs as program
            join public.residency_event_programs as link
              on link.residency_program_id = program.id

            union all

            select
              event.listed_institution_name as label,
              'name:' || lower(event.listed_institution_name) as value
            from public.residency_events as event
            where event.listed_institution_name is not null
              and not exists (
                select 1
                from public.residency_event_programs as link
                where link.event_id = event.id
              )
          ) as raw_options
        ) as options
      ),
      '[]'::jsonb
    ),
    'locations', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'label', options.city || ', ' || options.state,
            'value', options.state || '|' || options.city
          )
          order by options.state, options.city
        )
        from (
          select distinct program.city, program.state
          from public.residency_programs as program
          join public.residency_event_programs as link
            on link.residency_program_id = program.id
          where program.city is not null and program.state is not null
        ) as options
      ),
      '[]'::jsonb
    )
  );
$$;
revoke all on function public.get_residency_event_filter_options() from public;
grant execute on function public.get_residency_event_filter_options() to authenticated;
create or replace function public.import_residency_event_row(
  p_acgme_id text,
  p_event jsonb,
  p_match_method text,
  p_match_confidence numeric,
  p_research_note text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_program_id uuid;
  target_event_id uuid;
  existing_event_id uuid;
  inserted_link_count integer := 0;
  research_status_updated boolean := false;
begin
  if nullif(btrim(p_acgme_id), '') is not null then
    select program.id
    into target_program_id
    from public.residency_programs as program
    where program.acgme_id = btrim(p_acgme_id);
  end if;

  select event.id
  into existing_event_id
  from public.residency_events as event
  where event.event_name = p_event->>'event_name'
    and event.event_date is not distinct from nullif(p_event->>'event_date', '')::date
    and event.source_url is not distinct from p_event->>'source_url';

  insert into public.residency_events (
    event_type,
    event_name,
    event_date,
    published_timing,
    listed_institution_name,
    listed_specialty,
    listed_acgme_id,
    start_time,
    end_time,
    time_zone,
    format,
    platform_or_location,
    event_scope,
    who_can_attend,
    program_leadership_present,
    residents_present,
    qa_available,
    registration_required,
    registration_url,
    event_url,
    status,
    source_verified,
    source_type,
    source_url,
    date_checked,
    notes
  ) values (
    p_event->>'event_type',
    p_event->>'event_name',
    nullif(p_event->>'event_date', '')::date,
    nullif(p_event->>'published_timing', ''),
    nullif(p_event->>'listed_institution_name', ''),
    nullif(p_event->>'listed_specialty', ''),
    nullif(p_event->>'listed_acgme_id', ''),
    nullif(p_event->>'start_time', '')::time,
    nullif(p_event->>'end_time', '')::time,
    nullif(p_event->>'time_zone', ''),
    nullif(p_event->>'format', ''),
    nullif(p_event->>'platform_or_location', ''),
    nullif(p_event->>'event_scope', ''),
    nullif(p_event->>'who_can_attend', ''),
    nullif(p_event->>'program_leadership_present', '')::boolean,
    nullif(p_event->>'residents_present', '')::boolean,
    nullif(p_event->>'qa_available', '')::boolean,
    nullif(p_event->>'registration_required', '')::boolean,
    nullif(p_event->>'registration_url', ''),
    nullif(p_event->>'event_url', ''),
    p_event->>'status',
    coalesce(nullif(p_event->>'source_verified', '')::boolean, false),
    nullif(p_event->>'source_type', ''),
    p_event->>'source_url',
    (p_event->>'date_checked')::date,
    nullif(p_event->>'notes', '')
  )
  on conflict (event_name, event_date, source_url) do update
  set
    event_type = excluded.event_type,
    published_timing = excluded.published_timing,
    listed_institution_name = excluded.listed_institution_name,
    listed_specialty = excluded.listed_specialty,
    listed_acgme_id = excluded.listed_acgme_id,
    start_time = excluded.start_time,
    end_time = excluded.end_time,
    time_zone = excluded.time_zone,
    format = excluded.format,
    platform_or_location = excluded.platform_or_location,
    event_scope = excluded.event_scope,
    who_can_attend = excluded.who_can_attend,
    program_leadership_present = excluded.program_leadership_present,
    residents_present = excluded.residents_present,
    qa_available = excluded.qa_available,
    registration_required = excluded.registration_required,
    registration_url = excluded.registration_url,
    event_url = excluded.event_url,
    status = excluded.status,
    source_verified = excluded.source_verified,
    source_type = excluded.source_type,
    date_checked = excluded.date_checked,
    notes = excluded.notes,
    updated_at = now()
  returning id into target_event_id;

  if target_program_id is not null then
    insert into public.residency_event_programs (
      event_id,
      residency_program_id,
      match_method,
      match_confidence
    ) values (
      target_event_id,
      target_program_id,
      p_match_method,
      p_match_confidence
    )
    on conflict (event_id, residency_program_id) do nothing;

    get diagnostics inserted_link_count = row_count;

    if inserted_link_count = 0 then
      update public.residency_event_programs
      set
        match_method = p_match_method,
        match_confidence = p_match_confidence
      where event_id = target_event_id
        and residency_program_id = target_program_id;
    end if;

    if p_event->>'status' = 'upcoming' then
      insert into public.residency_event_research_status (
        residency_program_id,
        search_status,
        last_checked_at,
        search_notes
      ) values (
        target_program_id,
        'found_upcoming',
        now(),
        p_research_note
      )
      on conflict (residency_program_id) do update
      set
        search_status = excluded.search_status,
        last_checked_at = excluded.last_checked_at,
        search_notes = excluded.search_notes;

      research_status_updated := true;
    end if;
  end if;

  return jsonb_build_object(
    'matched', target_program_id is not null,
    'event_id', target_event_id,
    'event_inserted', existing_event_id is null,
    'link_created', inserted_link_count = 1,
    'research_status_updated', research_status_updated
  );
end;
$$;
revoke all on function public.import_residency_event_row(text, jsonb, text, numeric, text)
from public, anon, authenticated;
grant execute on function public.import_residency_event_row(text, jsonb, text, numeric, text)
to service_role;
commit;
