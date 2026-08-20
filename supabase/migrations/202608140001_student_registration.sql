begin;

create type public.student_stage as enum (
  'step1',
  'step2ck',
  'step3',
  'residency_interviews'
);

alter table public.profiles
  add column first_name text,
  add column last_name text,
  add column email text,
  add column study_stage public.student_stage,
  add column phone_country_code text,
  add column phone_number text;

update public.profiles
set
  first_name = split_part(full_name, ' ', 1),
  last_name = nullif(btrim(substr(full_name, char_length(split_part(full_name, ' ', 1)) + 1)), ''),
  study_stage = target_exam::text::public.student_stage
where first_name is null or study_stage is null;

alter table public.profiles
  add constraint profiles_first_name_length
    check (first_name is null or char_length(btrim(first_name)) between 1 and 60),
  add constraint profiles_last_name_length
    check (last_name is null or char_length(btrim(last_name)) between 1 and 60),
  add constraint profiles_email_format
    check (email is null or (char_length(email) <= 254 and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$')),
  add constraint profiles_phone_country_code_format
    check (phone_country_code is null or phone_country_code ~ '^\+[1-9][0-9]{0,3}$'),
  add constraint profiles_phone_number_format
    check (phone_number is null or phone_number ~ '^[0-9]{5,15}$');

create unique index profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;

comment on column public.profiles.study_stage is
  'Student demographic journey stage. Kept separate from target_exam because residency interviews are not an exam.';
comment on column public.profiles.country_code is
  'ISO 3166-1 alpha-2 country of residence selected during registration.';
comment on column public.profiles.phone_country_code is
  'International calling prefix, including the leading plus sign.';
comment on column public.profiles.phone_number is
  'National phone number digits only, stored separately from the calling prefix.';

commit;
