begin;

create unique index residency_events_identity_idx
on public.residency_events(event_name, event_date, source_url);

comment on index public.residency_events_identity_idx is
  'Idempotent import identity: one source event name on one date at one source URL.';

create function public.import_residency_event_row(
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
  select program.id
  into target_program_id
  from public.residency_programs as program
  where program.acgme_id = p_acgme_id;

  if target_program_id is null then
    return jsonb_build_object('matched', false);
  end if;

  select event.id
  into existing_event_id
  from public.residency_events as event
  where event.event_name = p_event->>'event_name'
    and event.event_date = (p_event->>'event_date')::date
    and event.source_url = p_event->>'source_url';

  insert into public.residency_events (
    event_type,
    event_name,
    event_date,
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
    (p_event->>'event_date')::date,
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

  return jsonb_build_object(
    'matched', true,
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
