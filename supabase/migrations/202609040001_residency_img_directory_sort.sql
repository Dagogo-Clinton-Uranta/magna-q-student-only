begin;

alter table public.residencies
  add column img_resident_percentage numeric(5, 2)
    check (img_resident_percentage between 0 and 100),
  add column img_resident_reporting_year smallint
    check (img_resident_reporting_year between 2000 and 2100);

with latest_metrics as (
  select distinct on (metric.residency_id)
    metric.residency_id,
    metric.img_percentage,
    metric.reporting_year
  from public.residency_img_metrics as metric
  where metric.metric_type = 'img_resident_share'
  order by
    metric.residency_id,
    metric.reporting_year desc,
    metric.source_updated_at desc nulls last,
    metric.id desc
)
update public.residencies as residency
set
  img_resident_percentage = latest_metrics.img_percentage,
  img_resident_reporting_year = latest_metrics.reporting_year
from latest_metrics
where latest_metrics.residency_id = residency.id;

create index residencies_img_percentage_order_idx
on public.residencies(img_resident_percentage desc nulls last, source_order, id);

create or replace function public.sync_residency_img_directory_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_residency_id bigint := coalesce(new.residency_id, old.residency_id);
begin
  update public.residencies as residency
  set
    img_resident_percentage = latest.img_percentage,
    img_resident_reporting_year = latest.reporting_year
  from lateral (
    select
      metric.img_percentage,
      metric.reporting_year
    from public.residency_img_metrics as metric
    where metric.residency_id = target_residency_id
      and metric.metric_type = 'img_resident_share'
    order by
      metric.reporting_year desc,
      metric.source_updated_at desc nulls last,
      metric.id desc
    limit 1
  ) as latest
  where residency.id = target_residency_id;

  if not found then
    update public.residencies
    set
      img_resident_percentage = null,
      img_resident_reporting_year = null
    where id = target_residency_id;
  end if;

  return coalesce(new, old);
end;
$$;

create trigger residency_img_metrics_sync_directory
after insert or update or delete on public.residency_img_metrics
for each row execute function public.sync_residency_img_directory_fields();

do $$
declare
  populated_count integer;
begin
  select count(*) into populated_count
  from public.residencies
  where img_resident_percentage is not null;

  if populated_count <> 2313 then
    raise exception 'Expected 2313 residencies with IMG percentages, found %', populated_count;
  end if;
end;
$$;

commit;
