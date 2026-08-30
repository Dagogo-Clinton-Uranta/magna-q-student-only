begin;

alter table public.interview_processing_answers
  drop constraint interview_processing_answers_storage_kind_check;

alter table public.interview_processing_answers
  add constraint interview_processing_answers_storage_kind_check
  check (storage_kind in ('s3', 'r2', 'ephemeral'));

do $$
declare storage_reference_constraint text;
begin
  select con.conname into storage_reference_constraint
  from pg_constraint con
  where con.conrelid = 'public.interview_processing_answers'::regclass
    and con.contype = 'c'
    and pg_get_constraintdef(con.oid) like '%storage_kind <> ''s3''%';
  if storage_reference_constraint is not null then
    execute format(
      'alter table public.interview_processing_answers drop constraint %I',
      storage_reference_constraint
    );
  end if;
end $$;

alter table public.interview_processing_answers
  add constraint interview_processing_answers_durable_storage_reference_check
  check (storage_kind not in ('s3', 'r2') or storage_reference is not null);

comment on table public.interview_processing_answers is
  'Answer-level transcription and evaluation state. New interview recordings are stored durably in private Cloudflare R2 objects.';

comment on column public.interview_videos.s3_bucket is
  'Legacy column name containing the private Cloudflare R2 bucket for durable interview recordings.';

comment on column public.interview_videos.s3_key is
  'Legacy column name containing the private Cloudflare R2 object key for durable interview recordings.';

comment on column public.interview_videos.s3_url is
  'Legacy column name containing an internal r2:// storage reference; never a public URL.';

commit;
