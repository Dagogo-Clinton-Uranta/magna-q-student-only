begin;

-- The profile flag is a convenient projection for page guards. Stripe's
-- subscription status and billing period remain the authoritative entitlement.
alter table public.profiles
add column monthly_payment text not null default 'unpaid'
check (monthly_payment in ('paid', 'unpaid'));

comment on column public.profiles.monthly_payment is
  'Webhook-maintained paid/unpaid summary. Students cannot change this value themselves.';

-- There is exactly one current Stripe subscription projection per user. A
-- user-scoped fenced lease below serializes each current-provider read and
-- projection write even when Stripe delivers events concurrently or late.
create table public.billing_subscriptions (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text,
  stripe_subscription_id text,
  price_id text,
  status text not null default 'incomplete' check (
    status in (
      'incomplete', 'incomplete_expired', 'trialing', 'active',
      'past_due', 'canceled', 'unpaid', 'paused'
    )
  ),
  currency text not null default 'usd' check (currency = 'usd'),
  amount_minor integer not null default 10000 check (amount_minor = 10000),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  last_checkout_session_id text,
  checkout_attempt_id uuid,
  checkout_attempt_started_at timestamptz,
  last_stripe_event_created_at timestamptz,
  last_stripe_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (current_period_start is null and current_period_end is null)
    or (
      current_period_start is not null
      and current_period_end is not null
      and current_period_end > current_period_start
    )
  )
);

create unique index billing_subscriptions_stripe_customer_idx
on public.billing_subscriptions(stripe_customer_id);
create unique index billing_subscriptions_stripe_subscription_idx
on public.billing_subscriptions(stripe_subscription_id);
create unique index billing_subscriptions_checkout_session_idx
on public.billing_subscriptions(last_checkout_session_id);
create index billing_subscriptions_status_period_idx
on public.billing_subscriptions(status, current_period_end);

comment on table public.billing_subscriptions is
  'Server-written local projection of the user current Stripe subscription.';
comment on column public.billing_subscriptions.amount_minor is
  'Recurring subscription amount in the currency smallest unit (10000 means USD 100.00).';
comment on column public.billing_subscriptions.last_stripe_event_created_at is
  'Creation time of the signed Stripe event that most recently reconciled this row, retained for audit.';
comment on column public.billing_subscriptions.last_stripe_event_id is
  'ID of the Stripe event that last updated this subscription projection.';
comment on column public.billing_subscriptions.checkout_attempt_id is
  'Server-only compare-and-swap token used as the stable Stripe Checkout idempotency key.';

-- Payments are durable audit records. Customer name/email are snapshotted so
-- an administrator can investigate a dispute even after the profile changes.
-- Only safe display card data is stored; full card details never enter our DB.
create table public.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete restrict,
  user_name_snapshot text not null check (char_length(btrim(user_name_snapshot)) between 1 and 200),
  user_email_snapshot text not null check (char_length(btrim(user_email_snapshot)) between 3 and 320),
  status text not null check (
    status in (
      'draft', 'open', 'paid', 'void', 'uncollectible', 'refunded',
      'partially_refunded', 'disputed', 'failed'
    )
  ),
  currency text not null default 'usd' check (currency ~ '^[a-z]{3}$'),
  amount_subtotal_minor integer not null default 0 check (amount_subtotal_minor >= 0),
  discount_minor integer not null default 0 check (discount_minor >= 0),
  tax_minor integer not null default 0 check (tax_minor >= 0),
  amount_total_minor integer not null default 0 check (amount_total_minor >= 0),
  amount_paid_minor integer not null default 0 check (amount_paid_minor >= 0),
  stripe_invoice_id text,
  stripe_customer_id text,
  stripe_subscription_id text,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  stripe_checkout_session_id text,
  invoice_number text,
  invoice_url text,
  invoice_pdf_url text,
  card_brand text check (card_brand is null or char_length(card_brand) <= 40),
  card_last4 text check (card_last4 is null or card_last4 ~ '^[0-9]{4}$'),
  paid_at timestamptz,
  period_start timestamptz,
  period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (period_start is null and period_end is null)
    or (
      period_start is not null
      and period_end is not null
      and period_end > period_start
    )
  )
);

create unique index payments_stripe_invoice_idx
on public.payments(stripe_invoice_id);
create unique index payments_stripe_payment_intent_idx
on public.payments(stripe_payment_intent_id);
create unique index payments_stripe_charge_idx
on public.payments(stripe_charge_id);
create unique index payments_stripe_checkout_session_idx
on public.payments(stripe_checkout_session_id);
create index payments_paid_at_idx on public.payments(paid_at desc);
create index payments_user_paid_at_idx on public.payments(user_id, paid_at desc);
create index payments_email_search_idx on public.payments(lower(user_email_snapshot));
create index payments_name_search_idx on public.payments(lower(user_name_snapshot));

comment on table public.payments is
  'Immutable-by-client Stripe invoice/payment audit data with user identity snapshots.';
comment on column public.payments.amount_paid_minor is
  'Amount collected in the currency smallest unit; format as currency only at presentation time.';
comment on column public.payments.card_last4 is
  'Safe display-only last four digits supplied by Stripe; never store a PAN, CVC, or expiry here.';

-- Stripe retries webhooks and can deliver them out of order. Inserting the
-- event ID before processing gives the server an idempotency ledger.
create table public.stripe_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  stripe_object_id text,
  event_created_at timestamptz not null,
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now()
);
create index stripe_webhook_events_processing_idx
on public.stripe_webhook_events(processed_at, event_created_at);

comment on table public.stripe_webhook_events is
  'Server-only Stripe webhook idempotency and troubleshooting ledger.';

-- SES send attempts are retained separately from the payment itself so failed
-- dispute emails remain visible without modifying the financial audit record.
create table public.email_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  payment_id uuid references public.payments(id) on delete set null,
  user_id uuid not null references public.profiles(id) on delete restrict,
  to_email text not null check (char_length(btrim(to_email)) between 3 and 320),
  template_name text not null check (char_length(btrim(template_name)) between 1 and 120),
  provider_message_id text,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  error_message text,
  sent_by uuid references public.profiles(id) on delete set null,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index email_deliveries_payment_date_idx
on public.email_deliveries(payment_id, created_at desc);
create index email_deliveries_user_date_idx
on public.email_deliveries(user_id, created_at desc);

comment on table public.email_deliveries is
  'Audit history for Amazon SES payment-dispute and other company email sends.';

create trigger billing_subscriptions_updated
before update on public.billing_subscriptions
for each row execute function public.set_updated_at();
create trigger payments_updated
before update on public.payments
for each row execute function public.set_updated_at();

-- The webhook/server writes billing_subscriptions. This trigger keeps the
-- profile summary synchronized without trusting browser-supplied state.
create function public.sync_profile_monthly_payment()
returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  target_user_id uuid := coalesce(new.user_id, old.user_id);
begin
  update public.profiles
  set monthly_payment = case
    when exists (
      select 1
      from public.billing_subscriptions subscription
      where subscription.user_id = target_user_id
        and subscription.status = 'active'
        and subscription.current_period_start <= now()
        and subscription.current_period_end > now()
    ) then 'paid'
    else 'unpaid'
  end
  where id = target_user_id;
  return coalesce(new, old);
end $$;
revoke all on function public.sync_profile_monthly_payment() from public;

create trigger billing_subscription_profile_sync
after insert or update or delete on public.billing_subscriptions
for each row execute function public.sync_profile_monthly_payment();

-- Students retain normal profile editing, but cannot manufacture entitlement
-- by changing the webhook-maintained payment flag in their own JWT session.
create function public.prevent_monthly_payment_self_update()
returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.monthly_payment is distinct from old.monthly_payment
     -- SECURITY DEFINER changes current_user, so inspect the active SET ROLE
     -- value to distinguish a student request from a trusted server role.
     and current_setting('role', true) = 'authenticated'
     and auth.uid() = old.id
     and coalesce(public.current_user_role(), 'student') <> 'admin' then
    raise exception 'monthly payment status is managed by billing webhooks'
      using errcode = '42501';
  end if;
  return new;
end $$;
revoke all on function public.prevent_monthly_payment_self_update() from public;

create trigger profile_monthly_payment_guard
before update of monthly_payment on public.profiles
for each row execute function public.prevent_monthly_payment_self_update();

-- The original onboarding policy predates billing and would otherwise let a
-- student explicitly supply monthly_payment='paid' on their initial insert.
drop policy profiles_insert_own_student on public.profiles;
create policy profiles_insert_own_student
on public.profiles for insert to authenticated
with check (
  id = auth.uid()
  and role = 'student'
  and monthly_payment = 'unpaid'
);

alter table public.billing_subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.stripe_webhook_events enable row level security;
alter table public.email_deliveries enable row level security;

-- Students can inspect only their own subscription/payment history. Billing
-- writes are intentionally absent from authenticated grants and policies;
-- Stripe handlers use the trusted server client, whose Supabase role bypasses RLS.
create policy billing_subscriptions_own_or_admin_read
on public.billing_subscriptions for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy payments_own_or_admin_read
on public.payments for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');

create policy stripe_webhook_events_admin_read
on public.stripe_webhook_events for select to authenticated
using (public.current_user_role() = 'admin');

create policy email_deliveries_admin_read
on public.email_deliveries for select to authenticated
using (public.current_user_role() = 'admin');

-- Supabase projects can have broad default privileges on new public tables.
-- Remove them explicitly, then restore only the RLS-filtered read capability.
revoke all on public.billing_subscriptions, public.payments,
  public.stripe_webhook_events, public.email_deliveries from anon, authenticated;
grant select on public.billing_subscriptions, public.payments,
  public.stripe_webhook_events, public.email_deliveries to authenticated;

-- This is the single database definition of a current entitlement. Requiring
-- both fields makes a stale profile flag or an expired Stripe period fail safe.
create function public.student_has_paid_access()
returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.profiles profile
    where profile.id = auth.uid()
      and (
        profile.role = 'admin'
        or (
          profile.role = 'student'
          and profile.monthly_payment = 'paid'
          and exists (
            select 1
            from public.billing_subscriptions subscription
            where subscription.user_id = profile.id
              and subscription.status = 'active'
              and subscription.current_period_start <= now()
              and subscription.current_period_end > now()
          )
        )
      )
  )
$$;
revoke all on function public.student_has_paid_access() from public;
grant execute on function public.student_has_paid_access() to authenticated;

create function public.assert_paid_student()
returns void
language plpgsql stable security definer set search_path = '' as $$
declare
  actor_role public.user_role := public.current_user_role();
begin
  if actor_role = 'admin' then
    return;
  end if;
  if actor_role is distinct from 'student' then
    raise exception 'student role required' using errcode = '42501';
  end if;
  if not public.student_has_paid_access() then
    raise exception 'paid student subscription required' using errcode = '42501';
  end if;
end $$;
revoke all on function public.assert_paid_student() from public;
grant execute on function public.assert_paid_student() to authenticated;

-- A short logical lease serializes the provider GET and projection write across
-- application instances. Unlike event timestamps or process clocks, this
-- prevents two handlers from holding different Stripe snapshots concurrently.
create table public.stripe_billing_sync_leases (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  lease_id uuid not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.stripe_billing_sync_leases enable row level security;
revoke all on public.stripe_billing_sync_leases from anon, authenticated;

comment on table public.stripe_billing_sync_leases is
  'Server-only fenced leases that serialize Stripe provider reads and projection writes for one billing owner.';

create function public.claim_stripe_billing_sync(
  target_user_id uuid
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  claimed_lease_id uuid := extensions.gen_random_uuid();
  result uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = target_user_id and role = 'student'
  ) then
    raise exception 'student billing owner not found' using errcode = 'P0002';
  end if;

  insert into public.stripe_billing_sync_leases(
    user_id, lease_id, expires_at
  ) values (
    target_user_id, claimed_lease_id, clock_timestamp() + interval '5 minutes'
  ) on conflict (user_id) do update set
    lease_id = excluded.lease_id,
    expires_at = excluded.expires_at,
    updated_at = clock_timestamp()
  where public.stripe_billing_sync_leases.expires_at <= clock_timestamp()
  returning lease_id into result;
  return result;
end $$;
revoke all on function public.claim_stripe_billing_sync(uuid)
from public, anon, authenticated;
grant execute on function public.claim_stripe_billing_sync(uuid)
to service_role;

create function public.release_stripe_billing_sync(
  target_user_id uuid,
  target_lease_id uuid
) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  delete from public.stripe_billing_sync_leases
  where user_id = target_user_id
    and lease_id = target_lease_id;
  return found;
end $$;
revoke all on function public.release_stripe_billing_sync(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.release_stripe_billing_sync(uuid, uuid)
to service_role;

-- Claim one stable Checkout attempt per user. Concurrent form submissions all
-- receive the same token. After Stripe confirms the prior Session is terminal,
-- the caller may rotate it only by presenting the current token as a CAS value.
create function public.claim_stripe_checkout_attempt(
  target_user_id uuid,
  replace_attempt_id uuid default null
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
declare
  existing public.billing_subscriptions;
  claimed_attempt_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = target_user_id and role = 'student'
  ) then
    raise exception 'student profile not found' using errcode = 'P0002';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_user_id::text, 1));
  select * into existing
  from public.billing_subscriptions
  where user_id = target_user_id
  for update;

  if existing.id is null then
    claimed_attempt_id := extensions.gen_random_uuid();
    insert into public.billing_subscriptions(
      user_id, status, currency, amount_minor, checkout_attempt_id,
      checkout_attempt_started_at
    ) values (
      target_user_id, 'incomplete', 'usd', 10000, claimed_attempt_id, now()
    );
    return claimed_attempt_id;
  end if;

  if existing.checkout_attempt_id is null
     or (
       replace_attempt_id is not null
       and existing.checkout_attempt_id = replace_attempt_id
     ) then
    claimed_attempt_id := extensions.gen_random_uuid();
    update public.billing_subscriptions
    set checkout_attempt_id = claimed_attempt_id,
        checkout_attempt_started_at = now(),
        last_checkout_session_id = case
          when replace_attempt_id is not null then null
          else last_checkout_session_id
        end
    where user_id = target_user_id;
    return claimed_attempt_id;
  end if;

  return existing.checkout_attempt_id;
end $$;
revoke all on function public.claim_stripe_checkout_attempt(uuid, uuid)
from public, anon, authenticated;
grant execute on function public.claim_stripe_checkout_attempt(uuid, uuid)
to service_role;

-- Record the Session only if the action still owns the claimed attempt. A
-- delayed action therefore cannot overwrite the newer Session selected by a
-- concurrent expired/terminal retry.
create function public.record_stripe_checkout_session(
  target_user_id uuid,
  target_attempt_id uuid,
  target_session_id text,
  target_customer_id text,
  target_price_id text
) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  existing public.billing_subscriptions;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if target_attempt_id is null
     or nullif(btrim(target_session_id), '') is null
     or nullif(btrim(target_price_id), '') is null then
    raise exception 'Checkout attempt, Session, and Price are required'
      using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_user_id::text, 1));
  select * into existing
  from public.billing_subscriptions
  where user_id = target_user_id
  for update;

  if existing.id is null or existing.checkout_attempt_id <> target_attempt_id then
    return false;
  end if;
  if existing.stripe_customer_id is not null
     and target_customer_id is not null
     and existing.stripe_customer_id <> target_customer_id then
    raise exception 'Stripe customer does not match the billing owner'
      using errcode = '23514';
  end if;

  update public.billing_subscriptions
  set last_checkout_session_id = target_session_id,
      stripe_customer_id = coalesce(stripe_customer_id, target_customer_id),
      price_id = target_price_id,
      status = case
        when stripe_subscription_id is null then 'incomplete'
        else status
      end,
      currency = 'usd',
      amount_minor = 10000
  where user_id = target_user_id
    and checkout_attempt_id = target_attempt_id;
  return found;
end $$;
revoke all on function public.record_stripe_checkout_session(
  uuid, uuid, text, text, text
) from public, anon, authenticated;
grant execute on function public.record_stripe_checkout_session(
  uuid, uuid, text, text, text
) to service_role;

-- Apply a verified Stripe projection only while the caller owns the live
-- user-scoped fence. The lease serializes the provider read and this write,
-- including races between an old subscription and its replacement.
create function public.apply_stripe_subscription_event(
  target_user_id uuid,
  target_stripe_customer_id text,
  target_stripe_subscription_id text,
  target_price_id text,
  target_status text,
  target_currency text,
  target_amount_minor integer,
  target_period_start timestamptz,
  target_period_end timestamptz,
  target_cancel_at_period_end boolean,
  target_canceled_at timestamptz,
  target_checkout_session_id text,
  target_event_created_at timestamptz,
  target_event_id text,
  target_sync_lease_id uuid
) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  existing public.billing_subscriptions;
  active_lease_id uuid;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  if target_status not in (
    'incomplete', 'incomplete_expired', 'trialing', 'active',
    'past_due', 'canceled', 'unpaid', 'paused'
  ) then
    raise exception 'invalid Stripe subscription status' using errcode = '22023';
  end if;
  if target_currency <> 'usd' or target_amount_minor <> 10000 then
    raise exception 'unexpected Stripe subscription price' using errcode = '22023';
  end if;
  if target_period_start is null or target_period_end is null
     or target_period_end <= target_period_start then
    raise exception 'invalid Stripe subscription period' using errcode = '22023';
  end if;
  if target_event_created_at is null
     or nullif(btrim(target_event_id), '') is null
     or target_sync_lease_id is null then
    raise exception 'Stripe event identity is required' using errcode = '22023';
  end if;

  -- Advisory locking also serializes the initial-insert case, where no row
  -- exists yet for SELECT FOR UPDATE to lock.
  perform pg_advisory_xact_lock(hashtextextended(target_user_id::text, 0));
  select * into existing
  from public.billing_subscriptions
  where user_id = target_user_id
  for update;

  -- The lease must span the Stripe GET through this write. Its row is locked
  -- here so validation and deletion are atomic with applying the projection.
  select lease.lease_id into active_lease_id
  from public.stripe_billing_sync_leases lease
  where lease.user_id = target_user_id
    and lease.lease_id = target_sync_lease_id
    and lease.expires_at > clock_timestamp()
  for update;
  if active_lease_id is distinct from target_sync_lease_id then
    raise exception 'Stripe subscription sync lease is unavailable or expired'
      using errcode = '55P03';
  end if;

  insert into public.billing_subscriptions(
    user_id, stripe_customer_id, stripe_subscription_id, price_id, status,
    currency, amount_minor, current_period_start, current_period_end,
    cancel_at_period_end, canceled_at, last_checkout_session_id,
    last_stripe_event_created_at, last_stripe_event_id
  ) values (
    target_user_id, target_stripe_customer_id, target_stripe_subscription_id,
    target_price_id, target_status, target_currency, target_amount_minor,
    target_period_start, target_period_end, target_cancel_at_period_end,
    target_canceled_at, target_checkout_session_id, target_event_created_at,
    target_event_id
  )
  on conflict (user_id) do update set
    stripe_customer_id = excluded.stripe_customer_id,
    stripe_subscription_id = excluded.stripe_subscription_id,
    price_id = excluded.price_id,
    status = excluded.status,
    currency = excluded.currency,
    amount_minor = excluded.amount_minor,
    current_period_start = excluded.current_period_start,
    current_period_end = excluded.current_period_end,
    cancel_at_period_end = excluded.cancel_at_period_end,
    canceled_at = excluded.canceled_at,
    last_checkout_session_id = coalesce(
      excluded.last_checkout_session_id,
      public.billing_subscriptions.last_checkout_session_id
    ),
    last_stripe_event_created_at = excluded.last_stripe_event_created_at,
    last_stripe_event_id = excluded.last_stripe_event_id;
  delete from public.stripe_billing_sync_leases
  where user_id = target_user_id
    and lease_id = target_sync_lease_id;
  return true;
end $$;
revoke all on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, integer, timestamptz, timestamptz,
  boolean, timestamptz, text, timestamptz, text, uuid
) from public, anon, authenticated;
grant execute on function public.apply_stripe_subscription_event(
  uuid, text, text, text, text, text, integer, timestamptz, timestamptz,
  boolean, timestamptz, text, timestamptz, text, uuid
) to service_role;

-- Replace permissive practice-data policies. RPC checks below remain required
-- because SECURITY DEFINER functions deliberately bypass table RLS.
drop policy blocks_own on public.test_blocks;
drop policy block_questions_own_read on public.test_block_questions;
drop policy answers_own_read on public.answer_logs;
drop policy marks_own on public.user_question_marks;
drop policy notes_own on public.user_question_notes;

create policy test_blocks_paid_read
on public.test_blocks for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (user_id = auth.uid() and public.student_has_paid_access())
);

-- Block membership and lifecycle are written only through the guarded
-- SECURITY DEFINER RPCs below. Direct Data API writes could otherwise let a
-- student forge status, timers, membership counts, or answer state.
revoke insert, update on public.test_blocks, public.test_block_questions,
  public.answer_logs from authenticated;

create policy test_block_questions_paid_read
on public.test_block_questions for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (
    public.student_has_paid_access()
    and exists (
      select 1 from public.test_blocks block
      where block.id = block_id and block.user_id = auth.uid()
    )
  )
);

create policy answer_logs_paid_read
on public.answer_logs for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (user_id = auth.uid() and public.student_has_paid_access())
);

create policy question_marks_paid_read
on public.user_question_marks for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (user_id = auth.uid() and public.student_has_paid_access())
);
create policy question_marks_paid_insert
on public.user_question_marks for insert to authenticated
with check (user_id = auth.uid() and public.student_has_paid_access());
create policy question_marks_paid_update
on public.user_question_marks for update to authenticated
using (user_id = auth.uid() and public.student_has_paid_access())
with check (user_id = auth.uid() and public.student_has_paid_access());
create policy question_marks_paid_delete
on public.user_question_marks for delete to authenticated
using (user_id = auth.uid() and public.student_has_paid_access());

create policy question_notes_paid_read
on public.user_question_notes for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (user_id = auth.uid() and public.student_has_paid_access())
);
create policy question_notes_paid_insert
on public.user_question_notes for insert to authenticated
with check (user_id = auth.uid() and public.student_has_paid_access());
create policy question_notes_paid_update
on public.user_question_notes for update to authenticated
using (user_id = auth.uid() and public.student_has_paid_access())
with check (user_id = auth.uid() and public.student_has_paid_access());
create policy question_notes_paid_delete
on public.user_question_notes for delete to authenticated
using (user_id = auth.uid() and public.student_has_paid_access());

-- Apply the same database boundary to interview recordings. Admin access is
-- retained while unpaid students cannot create, read, or mutate recordings.
drop policy interview_videos_student_insert on public.interview_videos;
drop policy interview_videos_student_read on public.interview_videos;
drop policy interview_videos_student_update on public.interview_videos;
drop policy interview_videos_admin_delete on public.interview_videos;

create policy interview_videos_admin_insert
on public.interview_videos for insert to authenticated
with check (public.current_user_role() = 'admin');
create policy interview_videos_paid_read
on public.interview_videos for select to authenticated
using (
  public.current_user_role() = 'admin'
  or (user_id = auth.uid() and public.student_has_paid_access())
);
-- Interview lifecycle, storage pointers, AI feedback, and review fields are
-- server-managed. Students can read their rows but cannot directly update
-- protected columns through the Supabase Data API.
create policy interview_videos_admin_update
on public.interview_videos for update to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
create policy interview_videos_admin_delete
on public.interview_videos for delete to authenticated
using (public.current_user_role() = 'admin');

-- Existing RPC implementations are renamed and stripped of client EXECUTE.
-- Public wrappers keep every API signature stable while asserting entitlement
-- before the SECURITY DEFINER implementation can read or write practice data.
alter function public.student_eligible_question_count(uuid, public.question_usage_filter, uuid[], uuid[])
rename to student_eligible_question_count_billing_impl;
revoke all on function public.student_eligible_question_count_billing_impl(uuid, public.question_usage_filter, uuid[], uuid[]) from public, authenticated;

create function public.student_eligible_question_count(
  selected_exam_id uuid,
  usage_mode public.question_usage_filter,
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns bigint
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_eligible_question_count_billing_impl(
    selected_exam_id, usage_mode, selected_subject_ids, selected_category_ids
  );
end $$;
revoke all on function public.student_eligible_question_count(uuid, public.question_usage_filter, uuid[], uuid[]) from public;
grant execute on function public.student_eligible_question_count(uuid, public.question_usage_filter, uuid[], uuid[]) to authenticated;

alter function public.student_create_block(uuid, public.study_mode, public.question_usage_filter, uuid[], uuid[], integer)
rename to student_create_block_billing_impl;
revoke all on function public.student_create_block_billing_impl(uuid, public.study_mode, public.question_usage_filter, uuid[], uuid[], integer) from public, authenticated;

create function public.student_create_block(
  selected_exam_id uuid,
  selected_mode public.study_mode,
  usage_mode public.question_usage_filter,
  selected_subject_ids uuid[],
  selected_category_ids uuid[],
  requested_count integer
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_create_block_billing_impl(
    selected_exam_id, selected_mode, usage_mode, selected_subject_ids,
    selected_category_ids, requested_count
  );
end $$;
revoke all on function public.student_create_block(uuid, public.study_mode, public.question_usage_filter, uuid[], uuid[], integer) from public;
grant execute on function public.student_create_block(uuid, public.study_mode, public.question_usage_filter, uuid[], uuid[], integer) to authenticated;

alter function public.student_eligible_question_count_v2(uuid, public.question_usage_filter[], uuid[], uuid[])
rename to student_eligible_question_count_v2_billing_impl;
revoke all on function public.student_eligible_question_count_v2_billing_impl(uuid, public.question_usage_filter[], uuid[], uuid[]) from public, authenticated;

create function public.student_eligible_question_count_v2(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns bigint
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_eligible_question_count_v2_billing_impl(
    selected_exam_id, usage_modes, selected_subject_ids, selected_category_ids
  );
end $$;
revoke all on function public.student_eligible_question_count_v2(uuid, public.question_usage_filter[], uuid[], uuid[]) from public;
grant execute on function public.student_eligible_question_count_v2(uuid, public.question_usage_filter[], uuid[], uuid[]) to authenticated;

alter function public.student_create_block_v2(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], integer)
rename to student_create_block_v2_billing_impl;
revoke all on function public.student_create_block_v2_billing_impl(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], integer) from public, authenticated;

create function public.student_create_block_v2(
  selected_exam_id uuid,
  selected_mode public.study_mode,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[],
  requested_count integer
) returns uuid
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_create_block_v2_billing_impl(
    selected_exam_id, selected_mode, usage_modes, selected_subject_ids,
    selected_category_ids, requested_count
  );
end $$;
revoke all on function public.student_create_block_v2(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], integer) from public;
grant execute on function public.student_create_block_v2(uuid, public.study_mode, public.question_usage_filter[], uuid[], uuid[], integer) to authenticated;

alter function public.student_test_builder_taxonomy_counts(uuid)
rename to student_test_builder_taxonomy_counts_billing_impl;
revoke all on function public.student_test_builder_taxonomy_counts_billing_impl(uuid) from public, authenticated;

create function public.student_test_builder_taxonomy_counts(selected_exam_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_test_builder_taxonomy_counts_billing_impl(selected_exam_id);
end $$;
revoke all on function public.student_test_builder_taxonomy_counts(uuid) from public;
grant execute on function public.student_test_builder_taxonomy_counts(uuid) to authenticated;

alter function public.student_get_block_question(uuid, integer)
rename to student_get_block_question_billing_impl;
revoke all on function public.student_get_block_question_billing_impl(uuid, integer) from public, authenticated;

create function public.student_get_block_question(target_block_id uuid, target_position integer)
returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_get_block_question_billing_impl(target_block_id, target_position);
end $$;
revoke all on function public.student_get_block_question(uuid, integer) from public;
grant execute on function public.student_get_block_question(uuid, integer) to authenticated;

alter function public.student_submit_answer(uuid, integer, uuid, uuid, integer)
rename to student_submit_answer_billing_impl;
revoke all on function public.student_submit_answer_billing_impl(uuid, integer, uuid, uuid, integer) from public, authenticated;

create function public.student_submit_answer(
  target_block_id uuid,
  target_position integer,
  chosen_option_id uuid,
  submission_id uuid,
  reported_time_ms integer
) returns jsonb
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_submit_answer_billing_impl(
    target_block_id, target_position, chosen_option_id, submission_id, reported_time_ms
  );
end $$;
revoke all on function public.student_submit_answer(uuid, integer, uuid, uuid, integer) from public;
grant execute on function public.student_submit_answer(uuid, integer, uuid, uuid, integer) to authenticated;

alter function public.student_set_mark(uuid, integer, boolean)
rename to student_set_mark_billing_impl;
revoke all on function public.student_set_mark_billing_impl(uuid, integer, boolean) from public, authenticated;

create function public.student_set_mark(target_block_id uuid, target_position integer, should_mark boolean)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  perform public.student_set_mark_billing_impl(target_block_id, target_position, should_mark);
end $$;
revoke all on function public.student_set_mark(uuid, integer, boolean) from public;
grant execute on function public.student_set_mark(uuid, integer, boolean) to authenticated;

alter function public.student_save_note(uuid, text)
rename to student_save_note_billing_impl;
revoke all on function public.student_save_note_billing_impl(uuid, text) from public, authenticated;

create function public.student_save_note(target_question_id uuid, note_content text)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  perform public.student_save_note_billing_impl(target_question_id, note_content);
end $$;
revoke all on function public.student_save_note(uuid, text) from public;
grant execute on function public.student_save_note(uuid, text) to authenticated;

alter function public.student_suspend_block(uuid)
rename to student_suspend_block_billing_impl;
revoke all on function public.student_suspend_block_billing_impl(uuid) from public, authenticated;

create function public.student_suspend_block(target_block_id uuid)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  perform public.student_suspend_block_billing_impl(target_block_id);
end $$;
revoke all on function public.student_suspend_block(uuid) from public;
grant execute on function public.student_suspend_block(uuid) to authenticated;

alter function public.student_resume_block(uuid)
rename to student_resume_block_billing_impl;
revoke all on function public.student_resume_block_billing_impl(uuid) from public, authenticated;

create function public.student_resume_block(target_block_id uuid)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  perform public.student_resume_block_billing_impl(target_block_id);
end $$;
revoke all on function public.student_resume_block(uuid) from public;
grant execute on function public.student_resume_block(uuid) to authenticated;

alter function public.student_complete_block(uuid)
rename to student_complete_block_billing_impl;
revoke all on function public.student_complete_block_billing_impl(uuid) from public, authenticated;

create function public.student_complete_block(target_block_id uuid)
returns void
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  perform public.student_complete_block_billing_impl(target_block_id);
end $$;
revoke all on function public.student_complete_block(uuid) from public;
grant execute on function public.student_complete_block(uuid) to authenticated;

alter function public.student_block_results(uuid)
rename to student_block_results_billing_impl;
revoke all on function public.student_block_results_billing_impl(uuid) from public, authenticated;

create function public.student_block_results(target_block_id uuid)
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_block_results_billing_impl(target_block_id);
end $$;
revoke all on function public.student_block_results(uuid) from public;
grant execute on function public.student_block_results(uuid) to authenticated;

alter function public.student_dashboard_summary()
rename to student_dashboard_summary_billing_impl;
revoke all on function public.student_dashboard_summary_billing_impl() from public, authenticated;

create function public.student_dashboard_summary()
returns jsonb
language plpgsql stable security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_dashboard_summary_billing_impl();
end $$;
revoke all on function public.student_dashboard_summary() from public;
grant execute on function public.student_dashboard_summary() to authenticated;

alter function public.student_schedule_interview_analysis(uuid)
rename to student_schedule_interview_analysis_billing_impl;
revoke all on function public.student_schedule_interview_analysis_billing_impl(uuid) from public, authenticated;

create function public.student_schedule_interview_analysis(target_video_id uuid)
returns uuid
language plpgsql volatile security definer set search_path = '' as $$
begin
  perform public.assert_paid_student();
  return public.student_schedule_interview_analysis_billing_impl(target_video_id);
end $$;
revoke all on function public.student_schedule_interview_analysis(uuid) from public;
grant execute on function public.student_schedule_interview_analysis(uuid) to authenticated;

commit;
