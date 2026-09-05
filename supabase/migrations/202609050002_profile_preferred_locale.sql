begin;

alter table public.profiles
  add column preferred_locale text not null default 'en';

alter table public.profiles
  add constraint profiles_preferred_locale_supported
  check (preferred_locale in ('en', 'es', 'pt', 'fr', 'hi', 'bn'));

comment on column public.profiles.preferred_locale is
  'BCP 47 base language selected by the student. UI dictionaries live in application code; translated medical content must be separately reviewed before publication.';

commit;
