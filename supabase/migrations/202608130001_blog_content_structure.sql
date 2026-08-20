begin;

alter table public.blog_posts
  add column paragraph_1 text,
  add column paragraph_2 text,
  add column paragraph_3 text,
  add column paragraph_4 text,
  add column image_url_1 text,
  add column image_url_2 text,
  add column relevant_link text,
  add column link_title text;

update public.blog_posts
set
  title = replace(replace(title, 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  excerpt = replace(replace(excerpt, 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  content = replace(replace(content, 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  paragraph_1 = replace(replace(split_part(content, E'\n\n', 1), 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  paragraph_2 = replace(replace(split_part(content, E'\n\n', 2), 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  paragraph_3 = replace(replace(split_part(content, E'\n\n', 3), 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  paragraph_4 = replace(replace(split_part(content, E'\n\n', 4), 'Pract' || 'ise', 'Practice'), 'practi' || 'se', 'practice'),
  image_url_1 = image_urls[1],
  image_url_2 = image_urls[2],
  relevant_link = source_links->0->>'url',
  link_title = source_links->0->>'title';

alter table public.blog_posts
  add constraint blog_posts_four_paragraphs_when_published check (
    not published or (
      paragraph_1 is not null and paragraph_2 is not null and
      paragraph_3 is not null and paragraph_4 is not null and
      char_length(btrim(paragraph_1)) between 20 and 7500 and
      char_length(btrim(paragraph_2)) between 20 and 7500 and
      char_length(btrim(paragraph_3)) between 20 and 7500 and
      char_length(btrim(paragraph_4)) between 20 and 7500
    )
  ),
  add constraint blog_posts_two_images_when_published check (
    not published or (
      image_url_1 is not null and image_url_2 is not null and
      cardinality(image_urls) = 2 and cardinality(image_alt_texts) = 2 and
      image_url_1 = image_urls[1] and image_url_2 = image_urls[2] and
      image_url_1 ~ '^https?://' and image_url_2 ~ '^https?://'
    )
  ),
  add constraint blog_posts_one_link_when_published check (
    not published or (
      link_title is not null and relevant_link is not null and
      char_length(btrim(link_title)) between 2 and 180 and
      relevant_link ~ '^https?://'
    )
  );

comment on column public.blog_posts.paragraph_1 is 'First of exactly four rendered article paragraphs.';
comment on column public.blog_posts.image_url_1 is 'Public S3 URL rendered after paragraph one.';
comment on column public.blog_posts.image_url_2 is 'Public S3 URL rendered after paragraph three.';
comment on column public.blog_posts.relevant_link is 'The article relevant/further-reading URL.';
comment on column public.blog_posts.link_title is 'Display heading for the relevant link.';

commit;
