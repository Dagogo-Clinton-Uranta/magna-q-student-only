begin;

create type public.feature_request_status as enum (
  'submitted',
  'approved',
  'rejected'
);

create table public.feature_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  username text not null check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$'),
  user_name text not null check (char_length(btrim(user_name)) between 2 and 120),
  user_email text not null check (char_length(user_email) <= 254 and user_email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  title text not null check (char_length(btrim(title)) between 5 and 160),
  summary text not null check (char_length(btrim(summary)) between 40 and 5000),
  representative_quote text not null check (char_length(btrim(representative_quote)) between 5 and 500),
  image_url text not null check (image_url ~ '^https://'),
  image_path text,
  image_alt_text text not null check (char_length(btrim(image_alt_text)) between 5 and 240),
  image_credit_text text,
  image_credit_url text check (image_credit_url is null or image_credit_url ~ '^https://'),
  review_status public.feature_request_status not null default 'submitted',
  admin_notes text check (admin_notes is null or char_length(admin_notes) <= 5000),
  front_page_feature boolean not null default false,
  in_app_feature boolean not null default false,
  featured_at timestamptz,
  is_sample boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((is_sample and user_id is null) or (not is_sample and user_id is not null)),
  check (not (front_page_feature or in_app_feature) or review_status = 'approved')
);

create unique index feature_requests_one_front_page_idx
  on public.feature_requests (front_page_feature)
  where front_page_feature;
create index feature_requests_in_app_idx
  on public.feature_requests (featured_at desc)
  where in_app_feature;
create index feature_requests_user_idx
  on public.feature_requests (user_id, created_at desc);
create index feature_requests_review_idx
  on public.feature_requests (review_status, created_at desc);

create trigger feature_requests_updated
before update on public.feature_requests
for each row execute function public.set_updated_at();

create function public.enforce_feature_request_selections()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('feature_requests_in_app_limit'));

  if new.in_app_feature
     and (tg_op = 'INSERT' or not coalesce(old.in_app_feature, false))
     and (
       select count(*)
       from public.feature_requests
       where in_app_feature
         and id is distinct from new.id
     ) >= 6 then
    raise exception 'only six in-app features may be selected at once'
      using errcode = '23514';
  end if;

  if (new.front_page_feature or new.in_app_feature)
     and (
       tg_op = 'INSERT'
       or not (coalesce(old.front_page_feature, false) or coalesce(old.in_app_feature, false))
     ) then
    new.featured_at := coalesce(new.featured_at, now());
  end if;

  return new;
end;
$$;

create trigger feature_request_selection_limits
before insert or update on public.feature_requests
for each row execute function public.enforce_feature_request_selections();

create table public.feature_pulses (
  feature_id uuid not null references public.feature_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (feature_id, user_id)
);

create index feature_pulses_feature_created_idx
  on public.feature_pulses (feature_id, created_at desc);

create table public.feature_comments (
  id uuid primary key default extensions.gen_random_uuid(),
  feature_id uuid not null references public.feature_requests(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  username text not null check (username = lower(username) and username ~ '^[a-z0-9_]{3,24}$'),
  user_name text not null check (char_length(btrim(user_name)) between 2 and 120),
  content text not null check (char_length(btrim(content)) between 2 and 2000),
  mentioned_usernames text[] not null default '{}'::text[],
  moderation_status text not null check (moderation_status in ('accepted', 'rejected')),
  moderation_reasons text[] not null default '{}'::text[],
  created_at timestamptz not null default now()
);

create index feature_comments_visible_idx
  on public.feature_comments (feature_id, created_at)
  where moderation_status = 'accepted';
create index feature_comments_author_idx
  on public.feature_comments (user_id, created_at desc);

alter table public.feature_requests enable row level security;
alter table public.feature_pulses enable row level security;
alter table public.feature_comments enable row level security;

create policy feature_requests_read_visible
  on public.feature_requests
  for select
  to anon, authenticated
  using (
    (review_status = 'approved' and (front_page_feature or in_app_feature))
    or user_id = auth.uid()
    or coalesce(public.current_user_role()::text, '') = 'admin'
  );

create policy feature_requests_submit_own
  on public.feature_requests
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and not is_sample
    and review_status = 'submitted'
    and not front_page_feature
    and not in_app_feature
  );

create policy feature_requests_admin_update
  on public.feature_requests
  for update
  to authenticated
  using (coalesce(public.current_user_role()::text, '') = 'admin')
  with check (coalesce(public.current_user_role()::text, '') = 'admin');

create policy feature_pulses_read_published
  on public.feature_pulses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.feature_requests feature
      where feature.id = feature_id
        and feature.review_status = 'approved'
        and (feature.front_page_feature or feature.in_app_feature)
    )
  );

create policy feature_comments_read_visible
  on public.feature_comments
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or (
      moderation_status = 'accepted'
      and exists (
        select 1
        from public.feature_requests feature
        where feature.id = feature_id
          and feature.review_status = 'approved'
          and (feature.front_page_feature or feature.in_app_feature)
      )
    )
  );

grant select, insert on public.feature_requests to authenticated;
grant select, update on public.feature_requests to authenticated;
grant select on public.feature_requests to anon;
grant select on public.feature_pulses to authenticated;
grant select on public.feature_comments to authenticated;

create function public.toggle_feature_pulse(p_feature_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  pulse_added boolean;
  pulse_total bigint;
begin
  if auth.uid() is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;
  if not exists (
    select 1
    from public.feature_requests feature
    where feature.id = p_feature_id
      and feature.review_status = 'approved'
      and (feature.front_page_feature or feature.in_app_feature)
  ) then
    raise exception 'published feature not found' using errcode = 'P0002';
  end if;

  if exists (
    select 1 from public.feature_pulses
    where feature_id = p_feature_id and user_id = auth.uid()
  ) then
    delete from public.feature_pulses
    where feature_id = p_feature_id and user_id = auth.uid();
    pulse_added := false;
  else
    insert into public.feature_pulses (feature_id, user_id)
    values (p_feature_id, auth.uid());
    pulse_added := true;
  end if;

  select count(*) into pulse_total
  from public.feature_pulses
  where feature_id = p_feature_id;

  return jsonb_build_object('pulsed', pulse_added, 'count', pulse_total);
end;
$$;

revoke all on function public.toggle_feature_pulse(uuid) from public;
grant execute on function public.toggle_feature_pulse(uuid) to authenticated;

create function public.feature_mention_suggestions(
  p_feature_id uuid,
  p_query text default ''
) returns table (username text, is_featured_member boolean)
language sql
stable
security definer
set search_path = ''
as $$
  with feature as (
    select request.username
    from public.feature_requests request
    where request.id = p_feature_id
      and request.review_status = 'approved'
      and (request.front_page_feature or request.in_app_feature)
  )
  select profile.username,
    profile.username = feature.username as is_featured_member
  from public.profiles profile
  cross join feature
  where auth.uid() is not null
    and profile.onboarding_completed
    and profile.role = 'student'
    and profile.username ilike btrim(coalesce(p_query, '')) || '%'
  order by (profile.username = feature.username) desc, profile.username
  limit 8;
$$;

revoke all on function public.feature_mention_suggestions(uuid, text) from public;
grant execute on function public.feature_mention_suggestions(uuid, text)
  to authenticated;

create view public.community_features
with (security_barrier = true)
as
select
  feature.id,
  feature.user_id,
  feature.username,
  feature.user_name,
  feature.title,
  feature.summary,
  feature.representative_quote,
  feature.image_url,
  feature.image_alt_text,
  feature.image_credit_text,
  feature.image_credit_url,
  feature.front_page_feature,
  feature.in_app_feature,
  feature.featured_at,
  feature.is_sample,
  feature.created_at,
  (
    select count(*)
    from public.feature_pulses pulse
    where pulse.feature_id = feature.id
  ) as pulse_count,
  (
    select count(*)
    from public.feature_comments comment
    where comment.feature_id = feature.id
      and comment.moderation_status = 'accepted'
  ) as comment_count
from public.feature_requests feature
where feature.review_status = 'approved'
  and (feature.front_page_feature or feature.in_app_feature);

revoke all on public.community_features from public;
grant select on public.community_features to anon, authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
) values (
  'feature-images',
  'feature-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
) on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy feature_images_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'feature-images');

create policy feature_images_upload_own_folder
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'feature-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy feature_images_update_own_folder
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'feature-images'
    and owner_id = auth.uid()::text
  )
  with check (
    bucket_id = 'feature-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy feature_images_delete_own
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'feature-images'
    and owner_id = auth.uid()::text
  );

insert into public.feature_requests (
  id,
  user_id,
  username,
  user_name,
  user_email,
  title,
  summary,
  representative_quote,
  image_url,
  image_alt_text,
  image_credit_text,
  image_credit_url,
  review_status,
  front_page_feature,
  in_app_feature,
  featured_at,
  is_sample
) values (
  '5d4a77b9-cba2-4c31-b573-f46d54550d7e',
  null,
  'magnaq_community',
  'Magna-Q Community Research Collective',
  'community@magna-q.example',
  'Making clinical research easier to start, share, and strengthen',
  'This sample community spotlight follows an IMG-led research collective building a practical peer-review map for early-career doctors. Their project connects students with collaborators, helps first-time authors turn clinical questions into responsible study plans, and makes it easier to find constructive feedback before an abstract or manuscript leaves the team.',
  'Your work deserves more than a quiet tab on your laptop—it deserves the right community around it.',
  'https://images.pexels.com/photos/10532564/pexels-photo-10532564.jpeg?auto=compress&cs=tinysrgb&w=1600',
  'A medical researcher in a white coat holding research papers in a laboratory',
  'Sample image by Vincuk Konan on Pexels',
  'https://www.pexels.com/photo/doctor-in-white-medical-lab-gown-10532564/',
  'approved',
  true,
  true,
  now(),
  true
);

commit;
