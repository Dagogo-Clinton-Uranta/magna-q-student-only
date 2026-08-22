begin;

create table public.tracked_residencies (
  user_id uuid not null references public.profiles(id) on delete cascade,
  residency_id bigint not null references public.residencies(id) on delete cascade,
  notes text not null default '' check (char_length(notes) <= 10000),
  tracked_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, residency_id)
);

comment on table public.tracked_residencies is
  'Private student residency shortlist and program-specific notes.';
comment on column public.tracked_residencies.notes is
  'Private notes visible and editable only by the student who tracked the residency.';

create index tracked_residencies_user_date_idx
on public.tracked_residencies(user_id, tracked_at desc);

create trigger tracked_residencies_updated
before update on public.tracked_residencies
for each row execute function public.set_updated_at();

alter table public.tracked_residencies enable row level security;

create policy tracked_residencies_own
on public.tracked_residencies
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

grant select, insert, update, delete
on public.tracked_residencies to authenticated;

create function public.prevent_completed_profile_identity_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.onboarding_completed = true
     and (
       new.email is distinct from old.email
       or new.username is distinct from old.username
     )
     and coalesce(public.current_user_role(), 'student') <> 'admin'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'email and username cannot be changed after onboarding'
      using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profile_identity_guard
before update of email, username on public.profiles
for each row execute function public.prevent_completed_profile_identity_changes();

commit;
