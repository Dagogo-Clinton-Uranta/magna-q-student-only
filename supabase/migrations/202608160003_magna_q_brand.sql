begin;

alter table public.blog_posts
  alter column author_name set default 'Magna-Q Editorial Team';

update public.blog_posts
set author_name = replace(author_name, 'MediNexus Editorial Team', 'Magna-Q Editorial Team')
where author_name like '%MediNexus Editorial Team%';

commit;
