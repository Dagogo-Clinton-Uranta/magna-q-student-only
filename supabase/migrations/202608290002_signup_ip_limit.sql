begin;

create table public.signup_ip_limits (
  ip_hash text primary key check (char_length(ip_hash) = 64),
  successful_signups smallint not null default 0 check (successful_signups between 0 and 2),
  first_reserved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.signup_ip_limits enable row level security;

create function public.reserve_signup_ip_slot(raw_ip text)
returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  hashed_ip text;
  reserved boolean;
begin
  if raw_ip is null or char_length(btrim(raw_ip)) not between 3 and 64 then
    raise exception 'invalid signup network address' using errcode = '22023';
  end if;
  hashed_ip := encode(extensions.digest(btrim(lower(raw_ip)), 'sha256'), 'hex');

  insert into public.signup_ip_limits(ip_hash, successful_signups)
  values(hashed_ip, 1)
  on conflict(ip_hash) do update set
    successful_signups = public.signup_ip_limits.successful_signups + 1,
    updated_at = now()
  where public.signup_ip_limits.successful_signups < 2
  returning true into reserved;

  return coalesce(reserved, false);
end $$;

create function public.release_signup_ip_slot(raw_ip text)
returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare
  hashed_ip text;
  released boolean;
begin
  if raw_ip is null or char_length(btrim(raw_ip)) not between 3 and 64 then
    return false;
  end if;
  hashed_ip := encode(extensions.digest(btrim(lower(raw_ip)), 'sha256'), 'hex');

  update public.signup_ip_limits set
    successful_signups = successful_signups - 1,
    updated_at = now()
  where ip_hash = hashed_ip and successful_signups > 0
  returning true into released;

  delete from public.signup_ip_limits
  where ip_hash = hashed_ip and successful_signups = 0;
  return coalesce(released, false);
end $$;

revoke all on table public.signup_ip_limits from public, anon, authenticated;
revoke all on function public.reserve_signup_ip_slot(text) from public, anon, authenticated;
revoke all on function public.release_signup_ip_slot(text) from public, anon, authenticated;
grant execute on function public.reserve_signup_ip_slot(text) to service_role;
grant execute on function public.release_signup_ip_slot(text) to service_role;

comment on table public.signup_ip_limits is
'Permanent two-successful-signup limit per normalized client IP. Only SHA-256 IP hashes are retained.';

commit;
