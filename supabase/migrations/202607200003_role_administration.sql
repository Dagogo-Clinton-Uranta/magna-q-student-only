begin;
create table public.role_change_events (
  id uuid primary key default extensions.gen_random_uuid(),
  target_user_id uuid not null references public.profiles(id) on delete restrict,
  actor_id uuid not null references public.profiles(id) on delete restrict,
  previous_role public.user_role not null,
  new_role public.user_role not null,
  created_at timestamptz not null default now()
);
alter table public.role_change_events enable row level security;
create policy role_events_admin_read on public.role_change_events for select to authenticated
using (public.current_user_role() = 'admin');
grant select on public.role_change_events to authenticated;
create function public.assign_user_role(target_user_id uuid, new_role public.user_role)
returns void language plpgsql security definer set search_path = '' as $$
declare old_role public.user_role;
begin
  if public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  select role into old_role from public.profiles where id = target_user_id for update;
  if old_role is null then raise exception 'profile not found' using errcode = 'P0002'; end if;
  if old_role = new_role then return; end if;
  update public.profiles set role = new_role where id = target_user_id;
  insert into public.role_change_events(target_user_id, actor_id, previous_role, new_role)
  values(target_user_id, auth.uid(), old_role, new_role);
end $$;
revoke all on function public.assign_user_role(uuid, public.user_role) from public;
grant execute on function public.assign_user_role(uuid, public.user_role) to authenticated;
commit;
