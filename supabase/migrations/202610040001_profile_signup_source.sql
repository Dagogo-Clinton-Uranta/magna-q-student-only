begin;

alter table public.profiles
  add column signup_source text,
  add column signup_source_other text,
  add constraint profiles_signup_source_supported
    check (
      signup_source is null
      or signup_source in (
        'twitter',
        'google',
        'word_of_mouth',
        'instagram',
        'magna_q_agent',
        'other'
      )
    ),
  add constraint profiles_signup_source_other_valid
    check (
      (signup_source = 'other'
        and char_length(btrim(coalesce(signup_source_other, ''))) between 1 and 120)
      or (signup_source is distinct from 'other' and signup_source_other is null)
    );

comment on column public.profiles.signup_source is
  'The acquisition source selected by the student during initial registration.';
comment on column public.profiles.signup_source_other is
  'Free-text acquisition source supplied when signup_source is other.';

create function public.prevent_student_signup_source_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.signup_source is not null
     and (
       new.signup_source is distinct from old.signup_source
       or new.signup_source_other is distinct from old.signup_source_other
     )
     and coalesce(public.current_user_role(), 'student') <> 'admin'
     and coalesce(auth.jwt() ->> 'role', '') <> 'service_role'
     and session_user not in ('postgres', 'supabase_admin') then
    raise exception 'signup source changes require an administrator'
      using errcode = '42501';
  end if;
  return new;
end
$$;

create trigger profile_signup_source_guard
before update of signup_source, signup_source_other on public.profiles
for each row execute function public.prevent_student_signup_source_changes();

commit;
