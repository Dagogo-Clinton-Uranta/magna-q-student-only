begin;

alter table public.blog_posts
  alter column author_name set default 'Magna-Q Editorial Team';

update public.blog_posts
set
  author_name = 'Magna-Q Editorial Team',
  updated_at = now()
where author_name is distinct from 'Magna-Q Editorial Team';

do $$
declare
  blog_count integer;
  canonical_author_count integer;
  legacy_author_count integer;
  author_default text;
begin
  select count(*)
  into blog_count
  from public.blog_posts;

  select count(*)
  into canonical_author_count
  from public.blog_posts
  where author_name = 'Magna-Q Editorial Team';

  select count(*)
  into legacy_author_count
  from public.blog_posts
  where lower(author_name) like '%medinexus%';

  select column_default
  into author_default
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'blog_posts'
    and column_name = 'author_name';

  if canonical_author_count <> blog_count
     or legacy_author_count <> 0
     or author_default is distinct from '''Magna-Q Editorial Team''::text' then
    raise exception
      'Blog author standardization failed: % total, % canonical, % legacy, default %',
      blog_count,
      canonical_author_count,
      legacy_author_count,
      author_default;
  end if;
end;
$$;

commit;
