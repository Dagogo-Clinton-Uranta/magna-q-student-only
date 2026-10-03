begin;
-- The one-time purchase tables are owned by the student application and are
-- already present in the shared Supabase project. This migration is additive:
-- do not edit or replay 202609120002_interview_credit_billing.sql.

do $$
declare constraint_name text;
begin
  if to_regclass('public.interview_credit_purchases') is null then
    raise exception 'Apply the student interview-credit billing migration first';
  end if;

  for constraint_name in
    select conname
    from pg_constraint
    where conrelid = 'public.interview_credit_purchases'::regclass
      and contype = 'c'
      and (
        pg_get_constraintdef(oid) like '%status%pending%paid%expired%failed%'
        or pg_get_constraintdef(oid) like '%status = ''paid''%paid_at%'
      )
  loop
    execute format(
      'alter table public.interview_credit_purchases drop constraint %I',
      constraint_name
    );
  end loop;
end $$;
alter table public.interview_credit_purchases
  add constraint interview_credit_purchases_status_check check (
    status in (
      'pending', 'paid', 'expired', 'failed', 'refund_pending',
      'partially_refunded', 'refunded', 'disputed', 'dispute_won',
      'dispute_lost'
    )
  ),
  add constraint interview_credit_purchases_paid_at_check check (
    (status in (
      'paid', 'refund_pending', 'partially_refunded', 'refunded',
      'disputed', 'dispute_won', 'dispute_lost'
    )) = (paid_at is not null)
  );
create table public.stripe_refunds (
  id uuid primary key default extensions.gen_random_uuid(),
  purchase_id uuid not null references public.interview_credit_purchases(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  stripe_refund_id text unique,
  stripe_payment_intent_id text not null,
  stripe_charge_id text,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  reason text not null check (char_length(btrim(reason)) between 3 and 500),
  status text not null default 'pending' check (
    status in ('pending', 'created', 'pending_provider', 'succeeded', 'failed', 'canceled')
  ),
  requested_by uuid not null references public.profiles(id) on delete restrict,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  failed_at timestamptz,
  failure_reason text,
  credits_reversed integer not null default 0 check (credits_reversed >= 0),
  credits_unrecovered integer not null default 0 check (credits_unrecovered >= 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index stripe_refunds_purchase_idx on public.stripe_refunds(purchase_id, created_at desc);
create index stripe_refunds_status_idx on public.stripe_refunds(status, created_at desc);
create table public.stripe_disputes (
  id uuid primary key default extensions.gen_random_uuid(),
  purchase_id uuid not null references public.interview_credit_purchases(id) on delete restrict,
  user_id uuid not null references public.profiles(id) on delete restrict,
  stripe_dispute_id text not null unique,
  stripe_charge_id text not null,
  stripe_payment_intent_id text,
  amount_minor integer not null check (amount_minor > 0),
  currency text not null check (currency ~ '^[a-z]{3}$'),
  reason text,
  status text not null,
  evidence_due_by timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);
create index stripe_disputes_status_due_idx on public.stripe_disputes(status, evidence_due_by);
create index stripe_disputes_purchase_idx on public.stripe_disputes(purchase_id, created_at desc);
create table public.stripe_admin_webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.payment_admin_actions (
  id uuid primary key default extensions.gen_random_uuid(),
  administrator_id uuid not null references public.profiles(id) on delete restrict,
  action text not null check (action in (
    'refund_requested', 'refund_submitted', 'refund_failed',
    'refund_confirmed', 'dispute_opened', 'dispute_updated', 'dispute_closed'
  )),
  purchase_id uuid references public.interview_credit_purchases(id) on delete restrict,
  refund_id uuid references public.stripe_refunds(id) on delete restrict,
  dispute_id uuid references public.stripe_disputes(id) on delete restrict,
  amount_minor integer check (amount_minor is null or amount_minor > 0),
  reason text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now()
);
create index payment_admin_actions_purchase_idx on public.payment_admin_actions(purchase_id, created_at desc);
create trigger stripe_refunds_updated before update on public.stripe_refunds
for each row execute function public.set_updated_at();
create trigger stripe_disputes_updated before update on public.stripe_disputes
for each row execute function public.set_updated_at();
create trigger stripe_admin_webhook_events_updated before update on public.stripe_admin_webhook_events
for each row execute function public.set_updated_at();
alter table public.stripe_refunds enable row level security;
alter table public.stripe_disputes enable row level security;
alter table public.stripe_admin_webhook_events enable row level security;
alter table public.payment_admin_actions enable row level security;
-- Add the admin read path missing from the student-owned purchase tables.
create policy interview_credit_purchases_admin_read
on public.interview_credit_purchases for select to authenticated
using (public.current_user_role() = 'admin');
create policy interview_credit_usage_admin_read
on public.interview_credit_usage for select to authenticated
using (public.current_user_role() = 'admin');
create policy stripe_refunds_admin_read on public.stripe_refunds
for select to authenticated using (public.current_user_role() = 'admin');
create policy stripe_disputes_admin_read on public.stripe_disputes
for select to authenticated using (public.current_user_role() = 'admin');
create policy stripe_admin_webhook_events_admin_read on public.stripe_admin_webhook_events
for select to authenticated using (public.current_user_role() = 'admin');
create policy payment_admin_actions_admin_read on public.payment_admin_actions
for select to authenticated using (public.current_user_role() = 'admin');
revoke all on public.stripe_refunds, public.stripe_disputes,
  public.stripe_admin_webhook_events, public.payment_admin_actions from anon, authenticated;
grant select on public.stripe_refunds, public.stripe_disputes,
  public.stripe_admin_webhook_events, public.payment_admin_actions to authenticated;
-- A bounded, administrator-only listing function keeps email search and
-- pagination inside PostgreSQL. Credit usage is attributed FIFO within each
-- product ledger because the original student schema stores fungible account
-- usage rather than a purchase_id on each consumption row.
create function public.admin_list_interview_credit_purchases(
  target_status text default null,
  search_text text default null,
  page_size integer default 25,
  page_offset integer default 0
) returns table (
  id uuid,
  user_id uuid,
  full_name text,
  username text,
  email text,
  product_kind text,
  status text,
  credit_quantity integer,
  credits_used integer,
  amount_minor integer,
  currency text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  created_at timestamptz,
  total_count bigint
) language plpgsql stable security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  if page_size not between 1 and 100 or page_offset not between 0 and 1000000 then
    raise exception 'invalid pagination' using errcode = '22023';
  end if;
  if target_status is not null and target_status not in (
    'paid','refund_pending','partially_refunded','refunded',
    'disputed','dispute_won','dispute_lost'
  ) then
    raise exception 'invalid payment status' using errcode = '22023';
  end if;
  if char_length(coalesce(search_text, '')) > 120 then
    raise exception 'search text is too long' using errcode = '22023';
  end if;

  return query
  with enriched as (
    select
      purchase.id, purchase.user_id, profile.full_name, profile.username,
      auth_user.email::text, purchase.product_kind, purchase.status,
      purchase.credit_quantity,
      least(
        purchase.credit_quantity,
        greatest(0,
          (select count(*)::integer from public.interview_credit_usage usage
           where usage.user_id = purchase.user_id
             and usage.credit_source = case when purchase.product_kind = 'competency_pack'
               then 'paid_pack' else 'paid_mock' end)
          - coalesce((select sum(earlier.credit_quantity)::integer
              from public.interview_credit_purchases earlier
              where earlier.user_id = purchase.user_id
                and earlier.product_kind = purchase.product_kind
                and earlier.paid_at is not null
                and (earlier.paid_at < purchase.paid_at
                  or (earlier.paid_at = purchase.paid_at and earlier.id < purchase.id))), 0)
        )
      )::integer as credits_used,
      purchase.amount_minor, purchase.currency,
      purchase.stripe_payment_intent_id, purchase.paid_at, purchase.created_at
    from public.interview_credit_purchases purchase
    join public.profiles profile on profile.id = purchase.user_id
    join auth.users auth_user on auth_user.id = purchase.user_id
    where purchase.status in (
      'paid','refund_pending','partially_refunded','refunded',
      'disputed','dispute_won','dispute_lost'
    )
      and (target_status is null or purchase.status = target_status)
  ), filtered as (
    select enriched.* from enriched
    where nullif(btrim(search_text), '') is null
       or enriched.full_name ilike '%' || btrim(search_text) || '%'
       or coalesce(enriched.username, '') ilike '%' || btrim(search_text) || '%'
       or enriched.email ilike '%' || btrim(search_text) || '%'
       or coalesce(enriched.stripe_payment_intent_id, '') ilike '%' || btrim(search_text) || '%'
       or enriched.id::text = btrim(search_text)
  )
  select filtered.*, count(*) over() as total_count
  from filtered order by filtered.paid_at desc nulls last, filtered.id desc
  limit page_size offset page_offset;
end $$;
revoke all on function public.admin_list_interview_credit_purchases(text,text,integer,integer) from public, anon;
grant execute on function public.admin_list_interview_credit_purchases(text,text,integer,integer) to authenticated;
-- Reserve a full refund before contacting Stripe. Amount, currency, PaymentIntent,
-- user and administrator are all loaded from trusted database/session state.
create function public.request_full_interview_credit_refund(
  target_purchase_id uuid,
  target_reason text
) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  actor_id uuid := auth.uid();
  purchase_row public.interview_credit_purchases;
  refund_row public.stripe_refunds;
  action_id uuid := extensions.gen_random_uuid();
begin
  if actor_id is null or public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  if char_length(btrim(coalesce(target_reason, ''))) not between 3 and 500 then
    raise exception 'refund reason must be between 3 and 500 characters' using errcode = '22023';
  end if;

  select * into purchase_row from public.interview_credit_purchases
  where id = target_purchase_id for update;
  if not found then raise exception 'purchase not found' using errcode = 'P0002'; end if;
  if purchase_row.status <> 'paid' then
    raise exception 'only a paid purchase can be refunded' using errcode = '22023';
  end if;
  if purchase_row.stripe_payment_intent_id is null then
    raise exception 'purchase has no Stripe PaymentIntent' using errcode = '22023';
  end if;
  if exists (select 1 from public.stripe_refunds where purchase_id = purchase_row.id and status <> 'failed') then
    raise exception 'a refund already exists for this purchase' using errcode = '23505';
  end if;

  insert into public.stripe_refunds (
    purchase_id, user_id, stripe_payment_intent_id, amount_minor, currency,
    reason, status, requested_by
  ) values (
    purchase_row.id, purchase_row.user_id, purchase_row.stripe_payment_intent_id,
    purchase_row.amount_minor, purchase_row.currency, btrim(target_reason),
    'pending', actor_id
  ) returning * into refund_row;

  insert into public.payment_admin_actions (
    id, administrator_id, action, purchase_id, refund_id, amount_minor, reason
  ) values (
    action_id, actor_id, 'refund_requested', purchase_row.id, refund_row.id,
    purchase_row.amount_minor, btrim(target_reason)
  );
  update public.interview_credit_purchases set status = 'refund_pending'
  where id = purchase_row.id;

  return jsonb_build_object(
    'purchase_id', purchase_row.id,
    'refund_id', refund_row.id,
    'action_id', action_id,
    'payment_intent_id', purchase_row.stripe_payment_intent_id,
    'amount_minor', purchase_row.amount_minor,
    'currency', purchase_row.currency
  );
end $$;
revoke all on function public.request_full_interview_credit_refund(uuid,text) from public, anon;
grant execute on function public.request_full_interview_credit_refund(uuid,text) to authenticated;
create function public.mark_interview_credit_refund_submitted(
  target_refund_id uuid,
  target_stripe_refund_id text,
  target_stripe_charge_id text,
  target_provider_status text
) returns void
language plpgsql security definer set search_path = '' as $$
declare refund_row public.stripe_refunds;
begin
  if auth.uid() is null or public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  select * into refund_row from public.stripe_refunds where id = target_refund_id for update;
  if not found then raise exception 'refund not found' using errcode = 'P0002'; end if;
  if refund_row.stripe_refund_id = target_stripe_refund_id then return; end if;
  if refund_row.status <> 'pending' then
    raise exception 'refund is no longer awaiting submission' using errcode = '22023';
  end if;
  update public.stripe_refunds set
    stripe_refund_id = target_stripe_refund_id,
    stripe_charge_id = target_stripe_charge_id,
    status = case when target_provider_status = 'succeeded' then 'created' else 'pending_provider' end,
    metadata = metadata || jsonb_build_object('provider_status', target_provider_status)
  where id = target_refund_id and status = 'pending'
  returning * into refund_row;
  insert into public.payment_admin_actions (
    administrator_id, action, purchase_id, refund_id, amount_minor, reason
  ) values (
    auth.uid(), 'refund_submitted', refund_row.purchase_id, refund_row.id,
    refund_row.amount_minor, refund_row.reason
  );
end $$;
revoke all on function public.mark_interview_credit_refund_submitted(uuid,text,text,text) from public, anon;
grant execute on function public.mark_interview_credit_refund_submitted(uuid,text,text,text) to authenticated;
create function public.mark_interview_credit_refund_request_failed(
  target_refund_id uuid,
  target_failure_reason text
) returns void
language plpgsql security definer set search_path = '' as $$
declare refund_row public.stripe_refunds;
begin
  if auth.uid() is null or public.current_user_role() <> 'admin' then
    raise exception 'administrator role required' using errcode = '42501';
  end if;
  update public.stripe_refunds set status = 'failed', failed_at = now(),
    failure_reason = left(coalesce(target_failure_reason, 'Stripe request failed'), 1000)
  where id = target_refund_id and status = 'pending'
  returning * into refund_row;
  if found then
    update public.interview_credit_purchases set status = 'paid'
    where id = refund_row.purchase_id and status = 'refund_pending';
    insert into public.payment_admin_actions (
      administrator_id, action, purchase_id, refund_id, amount_minor, reason
    ) values (
      auth.uid(), 'refund_failed', refund_row.purchase_id, refund_row.id,
      refund_row.amount_minor, refund_row.failure_reason
    );
  end if;
end $$;
revoke all on function public.mark_interview_credit_refund_request_failed(uuid,text) from public, anon;
grant execute on function public.mark_interview_credit_refund_request_failed(uuid,text) to authenticated;
-- Webhook RPCs require the service-role JWT even though SECURITY DEFINER owns
-- their writes. Final credit reversal is idempotent and happens under row locks.
create function public.claim_stripe_admin_webhook_event(target_event_id text, target_event_type text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  insert into public.stripe_admin_webhook_events(stripe_event_id, event_type)
  values (target_event_id, target_event_type)
  on conflict (stripe_event_id) do update set
    event_type = excluded.event_type,
    processing_error = null
  where public.stripe_admin_webhook_events.processed_at is null
    and public.stripe_admin_webhook_events.processing_error is not null;
  return found;
end $$;
revoke all on function public.claim_stripe_admin_webhook_event(text,text) from public, anon, authenticated;
grant execute on function public.claim_stripe_admin_webhook_event(text,text) to service_role;
create function public.finish_stripe_admin_webhook_event(target_event_id text, target_error text default null)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  update public.stripe_admin_webhook_events set
    processed_at = case when target_error is null then now() else null end,
    processing_error = left(target_error, 2000)
  where stripe_event_id = target_event_id;
end $$;
revoke all on function public.finish_stripe_admin_webhook_event(text,text) from public, anon, authenticated;
grant execute on function public.finish_stripe_admin_webhook_event(text,text) to service_role;
create function public.record_stripe_refund_event(
  target_stripe_refund_id text, target_payment_intent_id text,
  target_charge_id text, target_amount_minor integer, target_currency text,
  target_status text, target_failure_reason text, target_metadata jsonb
) returns boolean language plpgsql security definer set search_path = '' as $$
declare purchase_row public.interview_credit_purchases;
declare refund_row public.stripe_refunds;
declare profile_row public.profiles;
declare reverse_count integer := 0;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  select * into purchase_row from public.interview_credit_purchases
  where stripe_payment_intent_id = target_payment_intent_id for update;
  if not found then return false; end if;

  select * into refund_row from public.stripe_refunds
  where stripe_refund_id = target_stripe_refund_id
     or (stripe_refund_id is null and purchase_id = purchase_row.id and status in ('pending','created','pending_provider'))
  order by (stripe_refund_id = target_stripe_refund_id) desc limit 1 for update;
  if not found then return false; end if;

  update public.stripe_refunds set
    stripe_refund_id = target_stripe_refund_id,
    stripe_charge_id = coalesce(target_charge_id, stripe_charge_id),
    status = case when target_status = 'succeeded' then 'succeeded'
                  when target_status in ('failed','canceled') then target_status
                  else 'pending_provider' end,
    completed_at = case when target_status = 'succeeded' then coalesce(completed_at, now()) else completed_at end,
    failed_at = case when target_status in ('failed','canceled') then coalesce(failed_at, now()) else failed_at end,
    failure_reason = target_failure_reason,
    metadata = metadata || coalesce(target_metadata, '{}'::jsonb)
  where id = refund_row.id;

  if target_status = 'succeeded' and refund_row.completed_at is null then
    select * into profile_row from public.profiles where id = purchase_row.user_id for update;
    -- This administration surface only initiates full refunds. If a partial
    -- refund is created directly in Stripe, retain all credits for manual
    -- review instead of applying an unsafe proportional/fungible reversal.
    if target_amount_minor >= purchase_row.amount_minor
       and purchase_row.product_kind = 'competency_pack' then
      reverse_count := least(purchase_row.credit_quantity, profile_row.interview_competency_credits);
      update public.profiles set interview_competency_credits = interview_competency_credits - reverse_count
      where id = purchase_row.user_id;
    elsif target_amount_minor >= purchase_row.amount_minor then
      reverse_count := least(purchase_row.credit_quantity, profile_row.interview_mock_credits);
      update public.profiles set interview_mock_credits = interview_mock_credits - reverse_count
      where id = purchase_row.user_id;
    end if;
    update public.stripe_refunds set credits_reversed = reverse_count,
      credits_unrecovered = purchase_row.credit_quantity - reverse_count where id = refund_row.id;
    update public.interview_credit_purchases set status =
      case when target_amount_minor < amount_minor then 'partially_refunded' else 'refunded' end
    where id = purchase_row.id;
    insert into public.payment_admin_actions(
      administrator_id, action, purchase_id, refund_id, amount_minor, reason, metadata
    ) values (
      refund_row.requested_by, 'refund_confirmed', purchase_row.id, refund_row.id,
      target_amount_minor, refund_row.reason,
      jsonb_build_object('credits_reversed', reverse_count,
        'credits_unrecovered', purchase_row.credit_quantity - reverse_count)
    );
  elsif target_status in ('failed','canceled') then
    update public.interview_credit_purchases set status = 'paid'
    where id = purchase_row.id and status = 'refund_pending';
  end if;
  return true;
end $$;
revoke all on function public.record_stripe_refund_event(text,text,text,integer,text,text,text,jsonb) from public, anon, authenticated;
grant execute on function public.record_stripe_refund_event(text,text,text,integer,text,text,text,jsonb) to service_role;
create function public.record_stripe_dispute_event(
  target_dispute_id text, target_charge_id text, target_payment_intent_id text,
  target_amount_minor integer, target_currency text, target_reason text,
  target_status text, target_evidence_due_by timestamptz, target_closed boolean
) returns boolean language plpgsql security definer set search_path = '' as $$
declare purchase_row public.interview_credit_purchases;
declare dispute_row public.stripe_disputes;
declare profile_row public.profiles;
declare reverse_count integer := 0;
begin
  if coalesce(auth.jwt()->>'role', '') <> 'service_role' then
    raise exception 'service role required' using errcode = '42501';
  end if;
  select * into purchase_row from public.interview_credit_purchases
  where stripe_payment_intent_id = target_payment_intent_id for update;
  if not found then return false; end if;
  insert into public.stripe_disputes(
    purchase_id,user_id,stripe_dispute_id,stripe_charge_id,stripe_payment_intent_id,
    amount_minor,currency,reason,status,evidence_due_by,closed_at
  ) values (
    purchase_row.id,purchase_row.user_id,target_dispute_id,target_charge_id,target_payment_intent_id,
    target_amount_minor,lower(target_currency),target_reason,target_status,target_evidence_due_by,
    case when target_closed then now() else null end
  ) on conflict (stripe_dispute_id) do update set
    status=excluded.status, reason=excluded.reason, evidence_due_by=excluded.evidence_due_by,
    closed_at=coalesce(public.stripe_disputes.closed_at,excluded.closed_at), updated_at=now()
  returning * into dispute_row;

  if target_closed and target_status = 'lost' then
    select * into profile_row from public.profiles where id = purchase_row.user_id for update;
    if purchase_row.status <> 'dispute_lost' then
      if purchase_row.product_kind = 'competency_pack' then
        reverse_count := least(purchase_row.credit_quantity, profile_row.interview_competency_credits);
        update public.profiles set interview_competency_credits=interview_competency_credits-reverse_count where id=purchase_row.user_id;
      else
        reverse_count := least(purchase_row.credit_quantity, profile_row.interview_mock_credits);
        update public.profiles set interview_mock_credits=interview_mock_credits-reverse_count where id=purchase_row.user_id;
      end if;
    end if;
    update public.interview_credit_purchases set status='dispute_lost' where id=purchase_row.id;
  elsif target_closed and target_status = 'won' then
    update public.interview_credit_purchases set status='dispute_won' where id=purchase_row.id;
  else
    update public.interview_credit_purchases set status='disputed' where id=purchase_row.id;
  end if;
  return true;
end $$;
revoke all on function public.record_stripe_dispute_event(text,text,text,integer,text,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.record_stripe_dispute_event(text,text,text,integer,text,text,text,timestamptz,boolean) to service_role;
commit;
