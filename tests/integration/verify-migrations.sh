#!/usr/bin/env bash
set -euo pipefail

pg_bin="/usr/lib/postgresql/16/bin"
cluster_dir="$(mktemp -d /tmp/medinexus-pg.XXXXXX)"
socket_dir="$(mktemp -d /tmp/medinexus-socket.XXXXXX)"
port="55439"

cleanup() {
  "$pg_bin/pg_ctl" -D "$cluster_dir" stop -m immediate >/dev/null 2>&1 || true
  rm -rf "$cluster_dir" "$socket_dir"
}
trap cleanup EXIT

"$pg_bin/initdb" -D "$cluster_dir" --auth=trust --no-locale >/dev/null
if ! "$pg_bin/pg_ctl" -D "$cluster_dir" -l "$cluster_dir/postgres.log" -o "-F -c listen_addresses='' -p $port -k $socket_dir" -w start >/dev/null; then
  cat "$cluster_dir/postgres.log"
  exit 1
fi

psql=(psql -h "$socket_dir" -p "$port" -U "$(id -un)" -d postgres -v ON_ERROR_STOP=1)
"${psql[@]}" >/dev/null <<'SQL'
create schema auth;
create schema storage;
create schema extensions;
create role authenticated nologin;
create role anon nologin;
create role service_role nologin bypassrls;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;
grant usage on schema auth to authenticated, anon, service_role;
grant execute on function auth.uid(), auth.jwt() to authenticated, anon, service_role;
create table auth.users (id uuid primary key, email text);
create table storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);
create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null references storage.buckets(id),
  name text not null,
  owner_id text
);
create function storage.foldername(name text)
returns text[] language sql immutable as $$
  select case
    when strpos(name, '/') = 0 then array[]::text[]
    else string_to_array(regexp_replace(name, '/[^/]*$', ''), '/')
  end
$$;
alter table storage.objects enable row level security;
SQL

for migration in supabase/migrations/*.sql; do
  "${psql[@]}" -f "$migration" >/dev/null
done
"${psql[@]}" -f supabase/seed.sql >/dev/null

"${psql[@]}" >/dev/null <<'SQL'
insert into auth.users(id, email)
values ('90000000-0000-0000-0000-000000000003', 'student@example.com');

insert into public.profiles(
  id, username, full_name, first_name, last_name, email, country_code,
  phone_country_code, phone_number, target_exam, study_stage, role,
  onboarding_completed
) values (
  '90000000-0000-0000-0000-000000000003', 'test_student', 'Test Student',
  'Test', 'Student', 'student@example.com', 'NG', '+234', '8012345678',
  'step2ck', 'step2ck', 'student', true
);

insert into public.billing_subscriptions(
  user_id, stripe_customer_id, stripe_subscription_id, price_id,
  status, currency, amount_minor, current_period_start, current_period_end
) values (
  '90000000-0000-0000-0000-000000000003', 'cus_student', 'sub_student',
  'price_monthly', 'active', 'usd', 10000,
  now() - interval '1 day', now() + interval '29 days'
);

set role authenticated;
set request.jwt.claim.sub = '90000000-0000-0000-0000-000000000003';
set request.jwt.claims = '{"sub":"90000000-0000-0000-0000-000000000003","role":"authenticated"}';

select public.assert_paid_student();

do $$
declare
  selected_exam_id uuid := (select id from public.exams where code = 'step2ck');
  medicine_id uuid := (
    select id from public.subjects
    where subjects.exam_id = (select id from public.exams where code = 'step2ck')
      and slug = 'medicine'
  );
  eligible integer;
  block_id uuid;
begin
  select public.student_eligible_question_count(
    selected_exam_id, 'unused', array[medicine_id], array[]::uuid[]
  ) into eligible;
  if eligible < 1 then
    raise exception 'student could not see seeded practice questions';
  end if;

  select public.student_create_block(
    selected_exam_id, 'tutor', 'unused', array[medicine_id], array[]::uuid[], 1
  ) into block_id;
  if block_id is null or not exists (
    select 1 from public.test_blocks
    where id = block_id and user_id = auth.uid()
  ) then
    raise exception 'student block creation failed';
  end if;

  perform public.submit_student_feedback(
    'Student portal',
    'The isolated migration test confirms student feedback submission works.'
  );
  if exists (select 1 from public.student_feedback) then
    raise exception 'anonymous feedback became readable to its submitter';
  end if;

  perform public.record_blog_post_read(
    (select id from public.blog_posts where published order by published_at limit 1)
  );

  begin
    update public.profiles set role = 'admin' where id = auth.uid();
    raise exception 'student unexpectedly changed role';
  exception when insufficient_privilege then null;
  end;

  begin
    update public.profiles set monthly_payment = 'unpaid' where id = auth.uid();
    raise exception 'student unexpectedly changed billing status';
  exception when insufficient_privilege then null;
  end;
end $$;

reset role;
do $$
begin
  if not public.reserve_signup_ip_slot('203.0.113.200') then
    raise exception 'first signup IP reservation was rejected';
  end if;
  if not public.reserve_signup_ip_slot('203.0.113.200') then
    raise exception 'second signup IP reservation was rejected';
  end if;
  if public.reserve_signup_ip_slot('203.0.113.200') then
    raise exception 'third signup IP reservation was accepted';
  end if;
  if not public.release_signup_ip_slot('203.0.113.200') then
    raise exception 'failed signup did not release its reserved slot';
  end if;
  if not public.reserve_signup_ip_slot('203.0.113.200') then
    raise exception 'released signup IP slot could not be reserved again';
  end if;
end $$;
delete from public.signup_ip_limits;

insert into public.interview_mock_sessions(
  id, user_id, specialty, status, selected_question_ids,
  current_question_index, started_at, completed_at
)
select
  ('91000000-0000-0000-0000-' || lpad(value::text, 12, '0'))::uuid,
  '90000000-0000-0000-0000-000000000003', 'general', 'completed',
  array['q1','q2','q3','q4','q5','q6','q7','q8'], 8,
  now() - make_interval(days => 10 - value),
  now() - make_interval(days => 10 - value)
from generate_series(1, 5) value;

insert into public.interview_question_evaluations(
  user_id, mock_session_id, question_id, question_text, question_type,
  practice_area, competencies, mock_position
) values (
  '90000000-0000-0000-0000-000000000003',
  '91000000-0000-0000-0000-000000000001',
  'q1', 'Retention-dependent evaluation', 'general',
  'communication-interpersonal', array['communication-interpersonal'], 0
);

insert into public.interview_mock_sessions(
  id, user_id, specialty, status, selected_question_ids,
  current_question_index, started_at, completed_at
) values (
  '91000000-0000-0000-0000-000000000006',
  '90000000-0000-0000-0000-000000000003', 'general', 'completed',
  array['q1','q2','q3','q4','q5','q6','q7','q8'], 8, now(), now()
), (
  '91000000-0000-0000-0000-000000000007',
  '90000000-0000-0000-0000-000000000003', 'general', 'in_progress',
  array['q1','q2','q3','q4','q5','q6','q7','q8'], 0, now(), null
);

insert into public.interview_individual_results(
  id, user_id, question_id, question_text, practice_area, question_type,
  specialty, status, created_at, completed_at
)
select
  ('92000000-0000-0000-0000-' || lpad(value::text, 12, '0'))::uuid,
  '90000000-0000-0000-0000-000000000003', 'q1', 'Retention result',
  'communication-interpersonal', 'general', 'general', 'completed',
  now() - make_interval(days => 10 - value),
  now() - make_interval(days => 10 - value)
from generate_series(1, 6) value;

do $$
begin
  if (select count(*) from public.interview_competency_definitions where version = '2026.08.1') <> 40 then
    raise exception 'interview competency seed did not create 40 definitions';
  end if;
  if (select count(*) from public.interview_rubric_families where version = '2026.08.1') <> 13 then
    raise exception 'interview rubric seed did not create 13 families';
  end if;
  if exists (
    select 1 from public.interview_rubric_families family,
    lateral (select sum((criterion->>'weight')::numeric) total from jsonb_array_elements(family.criteria) criterion) weights
    where abs(weights.total - 1) > 0.000001
  ) then
    raise exception 'interview rubric family weights do not total one';
  end if;
  if (select count(*) from public.interview_mock_sessions where user_id = '90000000-0000-0000-0000-000000000003' and status = 'completed') <> 5 then
    raise exception 'mock result retention did not retain exactly five completed rows';
  end if;
  if not exists (select 1 from public.interview_mock_sessions where id = '91000000-0000-0000-0000-000000000007') then
    raise exception 'mock result retention deleted an in-progress row';
  end if;
  if exists (select 1 from public.interview_question_evaluations where mock_session_id = '91000000-0000-0000-0000-000000000001') then
    raise exception 'mock dependent evaluation was not cascade-deleted';
  end if;
  if (select count(*) from public.interview_individual_results where user_id = '90000000-0000-0000-0000-000000000003' and status = 'completed') <> 5 then
    raise exception 'individual result retention did not retain exactly five completed rows independently';
  end if;
end $$;

select case when
  (select count(*) from public.blog_posts where published) >= 1
  and (select count(*) from public.test_blocks where user_id = auth.uid()) = 1
  and not has_table_privilege('authenticated', 'public.payments', 'INSERT')
then 'migration verification passed'
else 'migration verification failed' end;
SQL

result="$(${psql[@]} -Atc "
set role authenticated;
set request.jwt.claim.sub = '90000000-0000-0000-0000-000000000003';
set request.jwt.claims = '{\"sub\":\"90000000-0000-0000-0000-000000000003\",\"role\":\"authenticated\"}';
select case when
  (select count(*) from public.test_blocks where user_id = auth.uid()) = 1
then 'migration verification passed'
else 'migration verification failed' end;
")"

grep -q 'migration verification passed' <<<"$result"
echo "Student migration and seed verification passed."
