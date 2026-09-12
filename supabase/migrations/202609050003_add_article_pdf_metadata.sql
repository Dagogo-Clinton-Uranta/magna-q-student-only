begin;
alter table public.guidelines
  add column if not exists document_s3_url text,
  add column if not exists document_r2_key text,
  add column if not exists document_mime_type text,
  add column if not exists document_size_bytes bigint,
  add column if not exists document_uploaded_at timestamptz;
alter table public.resources
  add column if not exists document_r2_key text,
  add column if not exists document_mime_type text,
  add column if not exists document_size_bytes bigint,
  add column if not exists document_uploaded_at timestamptz;
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.guidelines'::regclass
      and conname = 'guidelines_document_s3_url_check'
  ) then
    alter table public.guidelines
      add constraint guidelines_document_s3_url_check
      check (document_s3_url is null or document_s3_url ~ '^https://');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.resources'::regclass
      and conname = 'resources_document_mime_type_check'
  ) then
    alter table public.resources
      add constraint resources_document_mime_type_check
      check (document_mime_type is null or document_mime_type = 'application/pdf');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.guidelines'::regclass
      and conname = 'guidelines_document_mime_type_check'
  ) then
    alter table public.guidelines
      add constraint guidelines_document_mime_type_check
      check (document_mime_type is null or document_mime_type = 'application/pdf');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.resources'::regclass
      and conname = 'resources_document_size_bytes_check'
  ) then
    alter table public.resources
      add constraint resources_document_size_bytes_check
      check (document_size_bytes is null or document_size_bytes > 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.guidelines'::regclass
      and conname = 'guidelines_document_size_bytes_check'
  ) then
    alter table public.guidelines
      add constraint guidelines_document_size_bytes_check
      check (document_size_bytes is null or document_size_bytes > 0);
  end if;
end;
$$;
comment on column public.resources.document_s3_url is
  'Legacy-named public URL for a downloadable PDF stored in Cloudflare R2; existing /assets/*.pdf paths remain supported.';
comment on column public.guidelines.document_s3_url is
  'Legacy-named public HTTPS URL for a downloadable PDF stored in Cloudflare R2.';
comment on column public.resources.document_r2_key is
  'Stable server-generated Cloudflare R2 object identifier used to verify, replace, and remove an article PDF.';
comment on column public.guidelines.document_r2_key is
  'Stable server-generated Cloudflare R2 object identifier used to verify, replace, and remove an article PDF.';
commit;
