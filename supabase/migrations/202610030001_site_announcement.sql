begin;

create table public.site_announcements (
  id text primary key default 'primary' check (id = 'primary'),
  message text not null check (
    message = btrim(message)
    and char_length(message) between 1 and 500
  ),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.site_announcements is
  'Admin-managed global announcement shown above the student application.';
comment on column public.site_announcements.id is
  'Singleton key. The global website banner always uses the primary row.';
comment on column public.site_announcements.enabled is
  'Disabled announcements remain available to administrators but are hidden from the website.';

create trigger site_announcements_updated
before update on public.site_announcements
for each row execute function public.set_updated_at();

alter table public.site_announcements enable row level security;

create policy site_announcements_enabled_read
on public.site_announcements
for select to anon, authenticated
using (enabled);

create policy site_announcements_admin_all
on public.site_announcements
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

grant select on public.site_announcements to anon;
grant select, insert, update, delete on public.site_announcements to authenticated;
grant all on public.site_announcements to service_role;

insert into public.site_announcements (id, message, enabled)
values (
  'primary',
  'try our free question banks now, Lab Reference values  recently added',
  true
);

commit;
