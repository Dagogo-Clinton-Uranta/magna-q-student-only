begin;

create table public.tracked_residency_events (
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.residency_events(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 10000),
  tracked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

comment on table public.tracked_residency_events is
  'Private student shortlist of residency open houses and networking opportunities.';
comment on column public.tracked_residency_events.notes is
  'Private event notes visible and editable only by the student who tracked the opportunity.';

create index tracked_residency_events_user_date_idx
on public.tracked_residency_events(user_id, tracked_at desc);

create trigger tracked_residency_events_updated
before update on public.tracked_residency_events
for each row execute function public.set_updated_at();

alter table public.tracked_residency_events enable row level security;

create policy tracked_residency_events_own
on public.tracked_residency_events
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete
on public.tracked_residency_events to authenticated;

create index residency_programs_location_idx
on public.residency_programs(state, city);

create view public.residency_event_directory
with (security_invoker = true)
as
select
  event.*,
  coalesce(
    array_agg(distinct program.id) filter (where program.id is not null),
    '{}'::uuid[]
  ) as program_ids,
  coalesce(
    array_agg(distinct program.program_name order by program.program_name)
      filter (where program.program_name is not null),
    '{}'::text[]
  ) as institution_names,
  coalesce(
    array_agg(distinct program.specialty order by program.specialty)
      filter (where program.specialty is not null),
    '{}'::text[]
  ) as specialties,
  coalesce(
    array_agg(distinct program.acgme_id order by program.acgme_id)
      filter (where program.acgme_id is not null),
    '{}'::text[]
  ) as acgme_ids,
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
  ) as location_keys
from public.residency_events as event
left join public.residency_event_programs as link on link.event_id = event.id
left join public.residency_programs as program on program.id = link.residency_program_id
group by event.id;

comment on view public.residency_event_directory is
  'One row per residency event with linked institution, specialty and location arrays for directory filtering.';

grant select on public.residency_event_directory to authenticated;

create function public.get_residency_event_filter_options()
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
          jsonb_build_object('label', options.program_name, 'value', options.id)
          order by options.program_name
        )
        from (
          select distinct program.id::text as id, program.program_name
          from public.residency_programs as program
          join public.residency_event_programs as link
            on link.residency_program_id = program.id
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

commit;
