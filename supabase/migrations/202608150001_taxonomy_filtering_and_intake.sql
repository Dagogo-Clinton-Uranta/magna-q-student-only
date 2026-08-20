begin;

-- Keep database-side feature access aligned with the application's temporary
-- free-access mode. Reinstating payments requires setting this row and the
-- PAYMENTS_ENABLED application variable to true.
create table public.product_feature_flags (
  feature_key text primary key,
  enabled boolean not null,
  updated_at timestamptz not null default now()
);
alter table public.product_feature_flags enable row level security;
revoke all on public.product_feature_flags from anon, authenticated;
insert into public.product_feature_flags(feature_key, enabled)
values ('payments', false)
on conflict (feature_key) do nothing;

create or replace function public.assert_paid_student()
returns void
language plpgsql stable security definer set search_path = '' as $$
declare
  actor_role public.user_role := public.current_user_role();
  payments_enabled boolean := coalesce((
    select enabled from public.product_feature_flags where feature_key = 'payments'
  ), false);
begin
  if actor_role = 'admin' then return; end if;
  if actor_role is distinct from 'student' then
    raise exception 'student role required' using errcode = '42501';
  end if;
  if payments_enabled and not public.student_has_paid_access() then
    raise exception 'paid student subscription required' using errcode = '42501';
  end if;
end $$;
revoke all on function public.assert_paid_student() from public;
grant execute on function public.assert_paid_student() to authenticated;

-- Questions can belong to multiple systems. The previous release reduced old
-- assignments to one before adding this index; new assignments remain fully
-- many-to-many after the index is removed.
drop index if exists public.question_categories_one_system_idx;

-- Allergy and Immunology may legitimately appear beneath both Medicine and
-- Surgery, matching the overlapping taxonomy requested by the product.
insert into public.subject_categories(subject_id, category_id)
select s.id, c.id
from public.subjects s
join public.categories c on c.exam_id = s.exam_id
where s.slug = 'surgery' and c.slug = 'allergy-and-immunology'
on conflict do nothing;

-- Require every question-system assignment to be supported by at least one of
-- that question's selected subjects. Trusted content ingestion inserts subjects
-- first, so this also protects direct authoring without duplicating its RPC.
create function public.enforce_question_system_subject_mapping()
returns trigger language plpgsql set search_path = '' as $$
begin
  if not exists (
    select 1
    from public.question_subjects qs
    join public.subject_categories sc
      on sc.subject_id = qs.subject_id
     and sc.category_id = new.category_id
    where qs.question_id = new.question_id
  ) then
    raise exception 'system is not available for the question subjects'
      using errcode = '23514';
  end if;
  return new;
end $$;

drop trigger if exists question_system_subject_guard on public.question_categories;
create trigger question_system_subject_guard
before insert or update on public.question_categories
for each row execute function public.enforce_question_system_subject_mapping();

-- Subject and system filters are an intersection. When systems are selected,
-- the same selected subject must map to a selected system assigned to the
-- question; unrelated subject/system tags can no longer satisfy each half.
create or replace function public.eligible_question_ids_v2(
  selected_exam_id uuid,
  usage_modes public.question_usage_filter[],
  selected_subject_ids uuid[],
  selected_category_ids uuid[] default array[]::uuid[]
) returns table(question_id uuid)
language sql stable security definer set search_path = '' as $$
  select q.id
  from public.questions q
  where q.exam_id = selected_exam_id
    and q.status = 'live'
    and cardinality(selected_subject_ids) > 0
    and cardinality(usage_modes) > 0
    and exists (
      select 1
      from public.question_subjects qs
      where qs.question_id = q.id
        and qs.subject_id = any(selected_subject_ids)
        and (
          cardinality(selected_category_ids) = 0
          or exists (
            select 1
            from public.question_categories qc
            join public.subject_categories sc
              on sc.subject_id = qs.subject_id
             and sc.category_id = qc.category_id
            where qc.question_id = q.id
              and qc.category_id = any(selected_category_ids)
          )
        )
    )
    and (
      ('unused' = any(usage_modes) and not exists (
        select 1 from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
      ))
      or ('incorrect' = any(usage_modes) and false = (
        select a.is_correct from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
        order by a.answered_at desc, a.id desc limit 1
      ))
      or ('correct' = any(usage_modes) and true = (
        select a.is_correct from public.answer_logs a
        where a.user_id = auth.uid() and a.question_id = q.id
        order by a.answered_at desc, a.id desc limit 1
      ))
      or ('marked' = any(usage_modes) and exists (
        select 1 from public.user_question_marks m
        where m.user_id = auth.uid() and m.question_id = q.id
      ))
    )
$$;
revoke all on function public.eligible_question_ids_v2(uuid,public.question_usage_filter[],uuid[],uuid[]) from public;

commit;
