begin;

create table public.blog_post_reads (
  id uuid primary key default extensions.gen_random_uuid(),
  blog_post_id uuid not null references public.blog_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (blog_post_id, user_id)
);

create index blog_post_reads_created_at_idx
on public.blog_post_reads(created_at desc);

comment on table public.blog_post_reads is
  'One durable read marker per student and published community article.';

alter table public.blog_post_reads enable row level security;
revoke all on public.blog_post_reads from anon, authenticated;

create function public.record_blog_post_read(target_blog_post_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null or public.current_user_role() <> 'student' then
    raise exception 'student authentication required' using errcode = '42501';
  end if;
  if not exists (
    select 1 from public.blog_posts
    where id = target_blog_post_id and published
  ) then
    raise exception 'published blog post not found' using errcode = 'P0002';
  end if;

  insert into public.blog_post_reads(blog_post_id, user_id)
  values(target_blog_post_id, auth.uid())
  on conflict (blog_post_id, user_id) do nothing;
end;
$$;

revoke all on function public.record_blog_post_read(uuid) from public;
grant execute on function public.record_blog_post_read(uuid) to authenticated;

commit;
