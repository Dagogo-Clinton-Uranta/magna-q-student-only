begin;

comment on column public.profiles.username is
  'Public, editable, case-insensitive username used in chat rooms, community features, mentions, and private-group invitations.';

create function public.username_available_for_current_user(candidate text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    auth.uid() is not null
    and candidate = lower(candidate)
    and candidate ~ '^[a-z0-9_]{3,24}$'
    and not exists (
      select 1
      from public.profiles
      where lower(username) = lower(candidate)
        and id <> auth.uid()
    );
$$;

revoke all on function public.username_available_for_current_user(text) from public;
grant execute on function public.username_available_for_current_user(text) to authenticated;

create function public.chat_mention_suggestions(p_query text default '')
returns table (username text)
language sql
stable
security definer
set search_path = ''
as $$
  select profile.username
  from public.profiles profile
  where auth.uid() is not null
    and profile.onboarding_completed
    and profile.role = 'student'
    and profile.username ilike btrim(coalesce(p_query, '')) || '%'
  order by profile.username
  limit 8;
$$;

revoke all on function public.chat_mention_suggestions(text) from public;
grant execute on function public.chat_mention_suggestions(text) to authenticated;

create function public.propagate_profile_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.username is distinct from old.username then
    update public.feature_requests
    set username = new.username
    where user_id = new.id;

    update public.feature_comments
    set username = new.username
    where user_id = new.id;

    update public.feature_comments
    set mentioned_usernames = array_replace(mentioned_usernames, old.username, new.username)
    where old.username = any(mentioned_usernames);
  end if;
  return new;
end;
$$;

create trigger profiles_propagate_username
after update of username on public.profiles
for each row execute function public.propagate_profile_username();

commit;
