begin;

create table public.interview_videos (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category text not null check (char_length(btrim(category)) between 2 and 120),
  question_answered text not null check (char_length(btrim(question_answered)) between 5 and 1000),
  status text not null default 'uploading' check (
    status in ('uploading', 'queued', 'analyzing', 'completed', 'failed', 'deleted')
  ),
  mime_type text not null default 'video/webm' check (mime_type like 'video/%'),
  duration_seconds integer not null check (duration_seconds between 1 and 125),
  width integer not null default 640 check (width between 160 and 1920),
  height integer not null default 360 check (height between 90 and 1080),
  byte_size bigint not null default 0 check (byte_size >= 0 and byte_size <= 52428800),
  s3_bucket text,
  s3_key text unique,
  s3_url text,
  multipart_upload_id text,
  upload_parts jsonb not null default '[]'::jsonb check (jsonb_typeof(upload_parts) = 'array'),
  recording_metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(recording_metadata) = 'object'),
  ai_feedback jsonb,
  processing_error text,
  admin_feedback text check (admin_feedback is null or char_length(admin_feedback) <= 10000),
  admin_feedback_by uuid references public.profiles(id) on delete set null,
  admin_feedback_at timestamptz,
  md_review_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz
);

create index interview_videos_user_date_idx
on public.interview_videos(user_id, created_at desc);
create index interview_videos_admin_queue_idx
on public.interview_videos(status, md_review_requested_at, created_at);

-- PostgreSQL is the durable outbox. BullMQ provides scalable delivery and
-- retries, while this row ensures a temporary Redis outage cannot lose work.
create table public.interview_analysis_jobs (
  id uuid primary key default extensions.gen_random_uuid(),
  video_id uuid not null unique references public.interview_videos(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','enqueued','processing','completed','failed')),
  attempts integer not null default 0 check (attempts >= 0),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index interview_analysis_jobs_recovery_idx
on public.interview_analysis_jobs(status, updated_at);

create trigger interview_videos_updated before update on public.interview_videos
for each row execute function public.set_updated_at();
create trigger interview_analysis_jobs_updated before update on public.interview_analysis_jobs
for each row execute function public.set_updated_at();

alter table public.interview_videos enable row level security;
alter table public.interview_analysis_jobs enable row level security;
create policy interview_videos_student_insert on public.interview_videos
for insert to authenticated
with check (user_id = auth.uid() and public.current_user_role() = 'student');
create policy interview_videos_student_read on public.interview_videos
for select to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_videos_student_update on public.interview_videos
for update to authenticated
using (user_id = auth.uid() or public.current_user_role() = 'admin')
with check (user_id = auth.uid() or public.current_user_role() = 'admin');
create policy interview_videos_admin_delete on public.interview_videos
for delete to authenticated
using (public.current_user_role() = 'admin');
create policy interview_analysis_jobs_admin_read on public.interview_analysis_jobs
for select to authenticated using (public.current_user_role() = 'admin');

grant select, insert, update, delete on public.interview_videos to authenticated;
grant select on public.interview_analysis_jobs to authenticated;

create function public.student_schedule_interview_analysis(target_video_id uuid)
returns uuid language plpgsql security definer set search_path = '' as $$
declare job_id uuid;
begin
  if not exists (
    select 1 from public.interview_videos
    where id = target_video_id and user_id = auth.uid() and status = 'uploading'
  ) then raise exception 'video upload not found' using errcode = 'P0002'; end if;
  insert into public.interview_analysis_jobs(video_id)
  values(target_video_id)
  on conflict (video_id) do update set status = 'pending', last_error = null
  returning id into job_id;
  return job_id;
end $$;
revoke all on function public.student_schedule_interview_analysis(uuid) from public;
grant execute on function public.student_schedule_interview_analysis(uuid) to authenticated;

commit;
