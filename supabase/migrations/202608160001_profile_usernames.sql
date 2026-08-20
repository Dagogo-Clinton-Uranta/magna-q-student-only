begin;

alter table public.profiles add column username text;

-- The earlier profile migration introduced email without copying historical
-- Auth emails. Exact email invitations should work for those accounts too.
update public.profiles p
set email = lower(u.email)
from auth.users u
where p.id = u.id and p.email is null and u.email is not null;

-- Existing accounts receive a stable, collision-resistant username. Users
-- created after this migration choose one during registration/onboarding.
update public.profiles
set username = 'user_' || substr(replace(id::text, '-', ''), 1, 16)
where username is null;

alter table public.profiles
  alter column username set not null,
  add constraint profiles_username_format
    check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$');

create unique index profiles_username_unique_idx
  on public.profiles (lower(username));

comment on column public.profiles.username is
  'Public, case-insensitive username used for exact private-group invitations.';

create function public.username_available(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    candidate = lower(candidate)
    and candidate ~ '^[a-z0-9_]{3,24}$'
    and not exists (
      select 1 from public.profiles where lower(username) = lower(candidate)
    );
$$;

revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- An authenticated student may resolve only an exact username or email. This
-- supports invitations without granting directory-wide profile access.
create function public.resolve_private_group_member(identifier text)
returns table (user_id uuid, username text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.username
  from public.profiles p
  where auth.uid() is not null
    and public.current_user_role() = 'student'
    and p.role = 'student'
    and p.onboarding_completed = true
    and (
      lower(p.username) = lower(btrim(identifier))
      or lower(p.email) = lower(btrim(identifier))
    )
  limit 1;
$$;

revoke all on function public.resolve_private_group_member(text) from public;
grant execute on function public.resolve_private_group_member(text) to authenticated;

commit;
