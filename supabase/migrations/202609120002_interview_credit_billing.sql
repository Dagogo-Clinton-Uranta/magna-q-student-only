begin;

alter table public.profiles
  add column interview_free_competency_used integer not null default 0
    check (interview_free_competency_used between 0 and 3),
  add column interview_competency_credits integer not null default 0
    check (interview_competency_credits >= 0),
  add column interview_mock_credits integer not null default 0
    check (interview_mock_credits >= 0);

comment on column public.profiles.interview_free_competency_used is
  'Number of the three complimentary competency video analyses already reserved.';
comment on column public.profiles.interview_competency_credits is
  'Unused competency video-and-analysis credits purchased in packs of ten.';
comment on column public.profiles.interview_mock_credits is
  'Unused eight-question mock interview credits purchased individually.';

create function public.prevent_interview_credit_self_update()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if (
    new.interview_free_competency_used is distinct from old.interview_free_competency_used
    or new.interview_competency_credits is distinct from old.interview_competency_credits
    or new.interview_mock_credits is distinct from old.interview_mock_credits
  )
  and current_setting('role', true) = 'authenticated'
  and auth.uid() = old.id
  and coalesce(public.current_user_role(), 'student') <> 'admin' then
    raise exception 'interview credits are managed by server billing workflows'
      using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.prevent_interview_credit_self_update() from public;

create trigger profile_interview_credit_guard
before update of interview_free_competency_used, interview_competency_credits, interview_mock_credits
on public.profiles
for each row execute function public.prevent_interview_credit_self_update();

drop policy profiles_insert_own_student on public.profiles;
create policy profiles_insert_own_student
on public.profiles for insert to authenticated
with check (
  id = auth.uid()
  and role = 'student'
  and monthly_payment = 'unpaid'
  and interview_free_competency_used = 0
  and interview_competency_credits = 0
  and interview_mock_credits = 0
);

create table public.interview_credit_purchases (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_kind text not null check (product_kind in ('competency_pack', 'mock_interview')),
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'failed')),
  credit_quantity integer not null check (credit_quantity > 0),
  amount_minor integer not null check (amount_minor > 0),
  currency text not null default 'usd' check (currency = 'usd'),
  stripe_price_id text not null,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  stripe_customer_id text,
  stripe_event_id text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (product_kind = 'competency_pack' and credit_quantity = 10 and amount_minor = 1000)
    or (product_kind = 'mock_interview' and credit_quantity = 1 and amount_minor = 500)
  ),
  check ((status = 'paid') = (paid_at is not null))
);
create index interview_credit_purchases_user_idx
on public.interview_credit_purchases(user_id, created_at desc);
create trigger interview_credit_purchases_updated
before update on public.interview_credit_purchases
for each row execute function public.set_updated_at();

create table public.interview_credit_usage (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_kind text not null check (product_kind in ('competency_video', 'mock_interview')),
  credit_source text not null check (credit_source in ('free', 'paid_pack', 'paid_mock')),
  video_id uuid references public.interview_videos(id) on delete set null,
  mock_session_id uuid references public.interview_mock_sessions(id) on delete set null,
  created_at timestamptz not null default now(),
  check (
    (product_kind = 'competency_video' and credit_source in ('free', 'paid_pack'))
    or (product_kind = 'mock_interview' and credit_source = 'paid_mock')
  )
);
create unique index interview_credit_usage_video_idx
on public.interview_credit_usage(video_id) where video_id is not null;
create unique index interview_credit_usage_mock_idx
on public.interview_credit_usage(mock_session_id) where mock_session_id is not null;
create index interview_credit_usage_user_idx
on public.interview_credit_usage(user_id, created_at desc);

alter table public.interview_videos
  add column billing_source text not null default 'legacy'
    check (billing_source in ('legacy', 'free', 'paid_pack', 'mock_session'));
alter table public.interview_mock_sessions
  add column billing_source text not null default 'legacy'
    check (billing_source in ('legacy', 'paid_mock'));

create function public.create_billed_interview_video(
  target_video_id uuid,
  target_user_id uuid,
  target_category text,
  target_question text,
  target_mime_type text,
  target_duration_seconds integer,
  target_width integer,
  target_height integer,
  target_byte_size bigint,
  target_s3_bucket text,
  target_s3_key text,
  target_recording_metadata jsonb,
  target_question_id text,
  target_mock_session_id uuid,
  target_mock_position integer
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  profile_row public.profiles;
  mock_row public.interview_mock_sessions;
  source text;
begin
  select * into profile_row
  from public.profiles
  where id = target_user_id and role = 'student'
  for update;
  if not found then
    raise exception 'student profile not found' using errcode = 'P0002';
  end if;

  if target_mock_session_id is not null then
    select * into mock_row
    from public.interview_mock_sessions
    where id = target_mock_session_id
      and user_id = target_user_id
      and status = 'in_progress'
      and current_question_index = target_mock_position
      and selected_question_ids[target_mock_position + 1] = target_question_id
    for update;
    if not found then
      return jsonb_build_object('allowed', false, 'reason', 'mock_not_current');
    end if;
    source := 'mock_session';
  elsif profile_row.interview_free_competency_used < 3 then
    update public.profiles
    set interview_free_competency_used = interview_free_competency_used + 1
    where id = target_user_id;
    source := 'free';
  elsif profile_row.interview_competency_credits > 0 then
    update public.profiles
    set interview_competency_credits = interview_competency_credits - 1
    where id = target_user_id;
    source := 'paid_pack';
  else
    return jsonb_build_object(
      'allowed', false,
      'reason', 'competency_credit_required',
      'free_remaining', 0,
      'paid_remaining', profile_row.interview_competency_credits
    );
  end if;

  insert into public.interview_videos (
    id, user_id, category, question_answered, mime_type, duration_seconds,
    width, height, byte_size, s3_bucket, s3_key, multipart_upload_id,
    recording_metadata, status, question_id, mock_session_id, mock_position,
    individual_result_id, billing_source
  ) values (
    target_video_id, target_user_id, target_category, target_question,
    target_mime_type, target_duration_seconds, target_width, target_height,
    target_byte_size, target_s3_bucket, target_s3_key, null,
    target_recording_metadata, 'uploading', target_question_id,
    target_mock_session_id, target_mock_position, null, source
  );

  if target_mock_session_id is null then
    insert into public.interview_credit_usage (
      user_id, product_kind, credit_source, video_id
    ) values (
      target_user_id, 'competency_video', source, target_video_id
    );
  end if;

  select * into profile_row from public.profiles where id = target_user_id;
  return jsonb_build_object(
    'allowed', true,
    'billing_source', source,
    'free_remaining', greatest(0, 3 - profile_row.interview_free_competency_used),
    'paid_remaining', profile_row.interview_competency_credits,
    'mock_remaining', profile_row.interview_mock_credits
  );
end $$;
revoke all on function public.create_billed_interview_video(uuid,uuid,text,text,text,integer,integer,integer,bigint,text,text,jsonb,text,uuid,integer) from public, authenticated;
grant execute on function public.create_billed_interview_video(uuid,uuid,text,text,text,integer,integer,integer,bigint,text,text,jsonb,text,uuid,integer) to service_role;

create function public.create_billed_mock_interview(
  target_session_id uuid,
  target_user_id uuid,
  target_specialty text,
  target_question_ids text[]
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare profile_row public.profiles;
begin
  if cardinality(target_question_ids) <> 8 then
    raise exception 'a mock interview requires eight questions' using errcode = '22023';
  end if;
  select * into profile_row
  from public.profiles
  where id = target_user_id and role = 'student'
  for update;
  if not found then
    raise exception 'student profile not found' using errcode = 'P0002';
  end if;
  if profile_row.interview_mock_credits < 1 then
    return jsonb_build_object('allowed', false, 'reason', 'mock_credit_required');
  end if;

  update public.profiles
  set interview_mock_credits = interview_mock_credits - 1
  where id = target_user_id;
  insert into public.interview_mock_sessions (
    id, user_id, specialty, selected_question_ids, status,
    current_question_index, billing_source
  ) values (
    target_session_id, target_user_id, target_specialty, target_question_ids,
    'in_progress', 0, 'paid_mock'
  );
  insert into public.interview_credit_usage (
    user_id, product_kind, credit_source, mock_session_id
  ) values (
    target_user_id, 'mock_interview', 'paid_mock', target_session_id
  );
  return jsonb_build_object(
    'allowed', true,
    'mock_remaining', profile_row.interview_mock_credits - 1
  );
end $$;
revoke all on function public.create_billed_mock_interview(uuid,uuid,text,text[]) from public, authenticated;
grant execute on function public.create_billed_mock_interview(uuid,uuid,text,text[]) to service_role;

create function public.grant_interview_credit_purchase(
  target_purchase_id uuid,
  target_user_id uuid,
  target_checkout_session_id text,
  target_payment_intent_id text,
  target_customer_id text,
  target_event_id text,
  target_paid_at timestamptz
) returns boolean
language plpgsql security definer set search_path = '' as $$
declare purchase_row public.interview_credit_purchases;
begin
  select * into purchase_row
  from public.interview_credit_purchases
  where id = target_purchase_id and user_id = target_user_id
  for update;
  if not found then
    return false;
  end if;
  if purchase_row.status = 'paid' then
    return true;
  end if;
  if purchase_row.status <> 'pending' then
    return false;
  end if;

  if purchase_row.product_kind = 'competency_pack' then
    update public.profiles
    set interview_competency_credits = interview_competency_credits + purchase_row.credit_quantity
    where id = target_user_id and role = 'student';
  elsif purchase_row.product_kind = 'mock_interview' then
    update public.profiles
    set interview_mock_credits = interview_mock_credits + purchase_row.credit_quantity
    where id = target_user_id and role = 'student';
  else
    return false;
  end if;
  if not found then
    raise exception 'student profile not found' using errcode = 'P0002';
  end if;

  update public.interview_credit_purchases set
    status = 'paid',
    stripe_checkout_session_id = target_checkout_session_id,
    stripe_payment_intent_id = target_payment_intent_id,
    stripe_customer_id = target_customer_id,
    stripe_event_id = target_event_id,
    paid_at = target_paid_at
  where id = target_purchase_id;
  return true;
end $$;
revoke all on function public.grant_interview_credit_purchase(uuid,uuid,text,text,text,text,timestamptz) from public, authenticated;
grant execute on function public.grant_interview_credit_purchase(uuid,uuid,text,text,text,text,timestamptz) to service_role;

alter table public.interview_credit_purchases enable row level security;
alter table public.interview_credit_usage enable row level security;
create policy interview_credit_purchases_owner_read
on public.interview_credit_purchases for select to authenticated
using (user_id = auth.uid());
create policy interview_credit_usage_owner_read
on public.interview_credit_usage for select to authenticated
using (user_id = auth.uid());
grant select on public.interview_credit_purchases to authenticated;
grant select on public.interview_credit_usage to authenticated;

drop policy interview_videos_paid_read on public.interview_videos;
create policy interview_videos_owner_read
on public.interview_videos for select to authenticated
using (public.current_user_role() = 'admin' or user_id = auth.uid());

commit;
