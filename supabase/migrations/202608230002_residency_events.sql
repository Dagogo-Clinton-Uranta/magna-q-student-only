begin;

-- The student portal already stores its populated directory in public.residencies.
-- This UUID-backed projection preserves that table and supplies the event domain
-- requested by the research workflow.
create table public.residency_programs (
  id uuid primary key default extensions.gen_random_uuid(),
  acgme_id varchar(30) not null unique,
  program_name text not null,
  specialty text not null,
  city varchar(150),
  state varchar(50),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.residency_programs (
  acgme_id,
  program_name,
  specialty,
  city,
  state,
  created_at,
  updated_at
)
select
  residency.acgme_id,
  residency.program_name,
  residency.specialty,
  residency.city,
  residency.state,
  residency.created_at,
  residency.updated_at
from public.residencies as residency
on conflict (acgme_id) do update
set
  program_name = excluded.program_name,
  specialty = excluded.specialty,
  city = excluded.city,
  state = excluded.state,
  updated_at = excluded.updated_at;

create table public.residency_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_type varchar(100) not null,
  event_name text not null,
  event_date date not null,
  start_time time,
  end_time time,
  time_zone varchar(100),
  format varchar(30),
  platform_or_location text,
  event_scope varchar(100),
  who_can_attend text,
  program_leadership_present boolean,
  residents_present boolean,
  qa_available boolean,
  registration_required boolean,
  registration_url text,
  event_url text,
  status varchar(30) not null default 'upcoming',
  source_verified boolean not null default false,
  source_type varchar(100),
  source_url text,
  date_checked date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint residency_events_format_check check (
    format is null
    or format in ('virtual', 'in_person', 'hybrid', 'unknown')
  ),
  constraint residency_events_status_check check (
    status in ('upcoming', 'completed', 'cancelled', 'postponed', 'unknown')
  )
);

create table public.residency_event_programs (
  id uuid primary key default extensions.gen_random_uuid(),
  event_id uuid not null references public.residency_events(id) on delete cascade,
  residency_program_id uuid not null references public.residency_programs(id) on delete cascade,
  match_method varchar(100),
  match_confidence numeric(4, 3),
  created_at timestamptz not null default now(),
  constraint residency_event_programs_event_program_unique
    unique (event_id, residency_program_id),
  constraint residency_event_programs_confidence_check check (
    match_confidence is null
    or match_confidence between 0.000 and 1.000
  )
);

create table public.residency_event_research_status (
  residency_program_id uuid primary key references public.residency_programs(id) on delete cascade,
  search_status varchar(50) not null default 'not_found',
  last_checked_at timestamptz not null default now(),
  next_recheck_at timestamptz,
  search_notes text,
  constraint residency_event_research_status_check check (
    search_status in (
      'found_upcoming',
      'found_completed',
      'not_found',
      'not_announced_yet',
      'needs_recheck'
    )
  )
);

create index idx_residency_events_date
on public.residency_events(event_date);

create index idx_residency_events_status
on public.residency_events(status);

create index idx_residency_events_type
on public.residency_events(event_type);

create index idx_residency_events_format
on public.residency_events(format);

create index idx_residency_event_program_program
on public.residency_event_programs(residency_program_id);

create index idx_residency_programs_specialty
on public.residency_programs(specialty);

-- The unique acgme_id constraint already creates a btree index. This named
-- index is retained because it is explicitly part of the supplied schema.
create index idx_residency_programs_acgme
on public.residency_programs(acgme_id);

create trigger residency_programs_updated
before update on public.residency_programs
for each row execute function public.set_updated_at();

create trigger residency_events_updated
before update on public.residency_events
for each row execute function public.set_updated_at();

alter table public.residency_programs enable row level security;
alter table public.residency_events enable row level security;
alter table public.residency_event_programs enable row level security;
alter table public.residency_event_research_status enable row level security;

create policy residency_programs_authenticated_read
on public.residency_programs
for select to authenticated
using (true);

create policy residency_programs_admin_all
on public.residency_programs
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy residency_events_authenticated_read
on public.residency_events
for select to authenticated
using (true);

create policy residency_events_admin_all
on public.residency_events
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy residency_event_programs_authenticated_read
on public.residency_event_programs
for select to authenticated
using (true);

create policy residency_event_programs_admin_all
on public.residency_event_programs
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

create policy residency_event_research_status_authenticated_read
on public.residency_event_research_status
for select to authenticated
using (true);

create policy residency_event_research_status_admin_all
on public.residency_event_research_status
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

revoke all on public.residency_programs from anon;
revoke all on public.residency_events from anon;
revoke all on public.residency_event_programs from anon;
revoke all on public.residency_event_research_status from anon;

grant select, insert, update, delete on public.residency_programs to authenticated;
grant select, insert, update, delete on public.residency_events to authenticated;
grant select, insert, update, delete on public.residency_event_programs to authenticated;
grant select, insert, update, delete on public.residency_event_research_status to authenticated;

comment on table public.residency_programs is
  'UUID-backed event-domain projection of the populated residency directory, keyed by ACGME ID.';
comment on table public.residency_events is
  'Program and institution residency recruiting, information and networking events.';
comment on table public.residency_event_programs is
  'Many-to-many links between events and residency programs, including match provenance and confidence.';
comment on table public.residency_event_research_status is
  'Per-program event research state; not_found does not imply that a program never holds events.';

do $$
declare
  source_program_count integer;
  projected_program_count integer;
  missing_program_count integer;
begin
  select count(*) into source_program_count from public.residencies;
  select count(*) into projected_program_count from public.residency_programs;
  select count(*)
  into missing_program_count
  from public.residencies as residency
  left join public.residency_programs as projected
    on projected.acgme_id = residency.acgme_id
  where projected.id is null;

  if source_program_count = 0
    or projected_program_count < source_program_count
    or missing_program_count <> 0
  then
    raise exception
      'Residency event schema backfill failed: source %, projected %, missing %',
      source_program_count,
      projected_program_count,
      missing_program_count;
  end if;
end;
$$;

commit;
