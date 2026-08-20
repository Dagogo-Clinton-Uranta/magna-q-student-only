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
  name text not null
);
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
