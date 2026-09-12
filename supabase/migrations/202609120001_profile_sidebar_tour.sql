begin;

alter table public.profiles
  add column sidebar_tour_completed boolean not null default false;

comment on column public.profiles.sidebar_tour_completed is
  'Whether the student has completed or dismissed the first-login sidebar tour.';

commit;
