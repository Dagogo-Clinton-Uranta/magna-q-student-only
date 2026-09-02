begin;

insert into public.blog_posts (
  slug,
  title,
  excerpt,
  content,
  paragraph_1,
  paragraph_2,
  paragraph_3,
  paragraph_4,
  category,
  author_name,
  image_urls,
  image_alt_texts,
  image_url_1,
  image_url_2,
  source_links,
  relevant_link,
  link_title,
  published,
  published_at
) values (
  '70-publications-to-match-what-nrmp-data-means',
  '70 Publications to Match? What the 2026 NRMP Data Actually Says',
  'The 2026 NRMP report lists a median of 70 publications for matched non-U.S. IMG neurological surgery applicants—but that number came from eight consenting applicants and is not a requirement, target, or prediction.',
  concat_ws(
    E'\n\n',
    $article$Seventy publications to match neurological surgery? That is the most dramatic number in NRMP’s July 2026 Charting Outcomes reports, but it needs a denominator and a definition. Among eight consenting non-U.S. IMG applicants who listed neurological surgery as their preferred specialty and matched in it, the median self-reported publication count was 70. That means the middle of this very small observed group was 70; it does not mean NRMP recommends 70, programs require 70, or an applicant with 69 cannot match. The 2026 reports also changed the measurement: abstracts, presentations, and publications are now three separate items. For this report, publications include peer-reviewed journal articles, book chapters, online publications, scientific monographs, and case reports. NRMP says the entries were self-reported, were not verified or evaluated, and may vary greatly in quality. Older reports combined abstracts, presentations, and publications, so their means should not be placed beside these new publication-only medians as evidence that research suddenly “counts more than ever.”$article$,
    $article$The verified medians for applicants who matched their preferred specialty show how sharply research volume varies by specialty and applicant type. In the order U.S. MD, U.S. DO, U.S. IMG, and non-U.S. IMG, the figures were: neurological surgery 12.5, 7.5, suppressed, and 70; integrated plastic surgery 10, suppressed, suppressed, and suppressed; dermatology 9, 6, 14, and suppressed; orthopaedic surgery 7, 2, suppressed, and suppressed; otolaryngology 6, 5, suppressed, and suppressed; general surgery 3, 2, 2, and 8; anesthesiology 2, 1, 2, and 4; internal medicine 2, 1, 1, and 3; obstetrics and gynecology 2, 1, 1.5, and 3; psychiatry 2, 1, 1, and 3; pediatrics 1, 1, 1, and 2; and family medicine 1, 0, 1, and 2. “Suppressed” is important: NRMP does not present specialty-and-outcome combinations with fewer than five consenting applicants. It should not be read as zero. The dermatology median of 14 for matched U.S. IMGs, for example, came from exactly five consenting applicants, while matched U.S. IMG neurological surgery had only two and was therefore suppressed.$article$,
    $article$The neurological surgery detail shows why a single median can create the wrong intuition. For the eight matched non-U.S. IMGs in the report, publication counts ranged from 20 to 136; the first quartile was 21 and the third quartile was 90. The matched U.S. MD neurological surgery group was much larger at 192 consenting applicants, with a median of 12.5, while the matched U.S. DO group contained nine and had a median of 7.5. Those are descriptions of different applicant populations, not causal estimates of what one more paper will do. Charting Outcomes examines association with matching to a preferred specialty and NRMP explicitly says the resource is not designed to predict success or failure. Research can communicate curiosity, persistence, mentorship, analytical skill, and commitment to a field, but a count cannot show authorship role, study quality, independence, relevance, or what an applicant learned. It also cannot replace program fit, clinical performance, letters, exam performance where considered, communication, or the rest of an application.$article$,
    $article$What should you do before programs can view 2027 MyERAS applications on September 23, 2026? First, report every scholarly product accurately and in the correct category; do not split one project into misleading entries or claim work that is only planned. Second, know your contribution. Prepare a concise explanation of the question, your role, one obstacle, the result, and what you would do next, because interviewers can learn more from that answer than from the number alone. Third, if your count is below your specialty’s median, do not apologize for existing only as a number. Connect substantive research, quality improvement, case reports, presentations, teaching, or other experiences to the skills you actually developed, while being honest about gaps. Finally, use the NRMP medians as context for a specialty-specific conversation with a knowledgeable advisor, not as a publication quota. Applicants may begin submitting on September 2, and programs may begin reviewing applications at 9 a.m. ET on September 23; the useful goal now is a complete, accurate application and the ability to discuss your work with clarity and integrity.$article$
  ),
  $article$Seventy publications to match neurological surgery? That is the most dramatic number in NRMP’s July 2026 Charting Outcomes reports, but it needs a denominator and a definition. Among eight consenting non-U.S. IMG applicants who listed neurological surgery as their preferred specialty and matched in it, the median self-reported publication count was 70. That means the middle of this very small observed group was 70; it does not mean NRMP recommends 70, programs require 70, or an applicant with 69 cannot match. The 2026 reports also changed the measurement: abstracts, presentations, and publications are now three separate items. For this report, publications include peer-reviewed journal articles, book chapters, online publications, scientific monographs, and case reports. NRMP says the entries were self-reported, were not verified or evaluated, and may vary greatly in quality. Older reports combined abstracts, presentations, and publications, so their means should not be placed beside these new publication-only medians as evidence that research suddenly “counts more than ever.”$article$,
  $article$The verified medians for applicants who matched their preferred specialty show how sharply research volume varies by specialty and applicant type. In the order U.S. MD, U.S. DO, U.S. IMG, and non-U.S. IMG, the figures were: neurological surgery 12.5, 7.5, suppressed, and 70; integrated plastic surgery 10, suppressed, suppressed, and suppressed; dermatology 9, 6, 14, and suppressed; orthopaedic surgery 7, 2, suppressed, and suppressed; otolaryngology 6, 5, suppressed, and suppressed; general surgery 3, 2, 2, and 8; anesthesiology 2, 1, 2, and 4; internal medicine 2, 1, 1, and 3; obstetrics and gynecology 2, 1, 1.5, and 3; psychiatry 2, 1, 1, and 3; pediatrics 1, 1, 1, and 2; and family medicine 1, 0, 1, and 2. “Suppressed” is important: NRMP does not present specialty-and-outcome combinations with fewer than five consenting applicants. It should not be read as zero. The dermatology median of 14 for matched U.S. IMGs, for example, came from exactly five consenting applicants, while matched U.S. IMG neurological surgery had only two and was therefore suppressed.$article$,
  $article$The neurological surgery detail shows why a single median can create the wrong intuition. For the eight matched non-U.S. IMGs in the report, publication counts ranged from 20 to 136; the first quartile was 21 and the third quartile was 90. The matched U.S. MD neurological surgery group was much larger at 192 consenting applicants, with a median of 12.5, while the matched U.S. DO group contained nine and had a median of 7.5. Those are descriptions of different applicant populations, not causal estimates of what one more paper will do. Charting Outcomes examines association with matching to a preferred specialty and NRMP explicitly says the resource is not designed to predict success or failure. Research can communicate curiosity, persistence, mentorship, analytical skill, and commitment to a field, but a count cannot show authorship role, study quality, independence, relevance, or what an applicant learned. It also cannot replace program fit, clinical performance, letters, exam performance where considered, communication, or the rest of an application.$article$,
  $article$What should you do before programs can view 2027 MyERAS applications on September 23, 2026? First, report every scholarly product accurately and in the correct category; do not split one project into misleading entries or claim work that is only planned. Second, know your contribution. Prepare a concise explanation of the question, your role, one obstacle, the result, and what you would do next, because interviewers can learn more from that answer than from the number alone. Third, if your count is below your specialty’s median, do not apologize for existing only as a number. Connect substantive research, quality improvement, case reports, presentations, teaching, or other experiences to the skills you actually developed, while being honest about gaps. Finally, use the NRMP medians as context for a specialty-specific conversation with a knowledgeable advisor, not as a publication quota. Applicants may begin submitting on September 2, and programs may begin reviewing applications at 9 a.m. ET on September 23; the useful goal now is a complete, accurate application and the ability to discuss your work with clarity and integrity.$article$,
  'Residency Interviews',
  'Magna-Q Editorial Team',
  array[
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1400&q=80'
  ],
  array[
    'Medical researchers collaborating around a laboratory table',
    'Residency applicant preparing for a professional interview'
  ],
  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1400&q=80',
  '[
    {"title":"NRMP: 2026 Charting Outcomes report overview","url":"https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-applicants-who-match-to-their-preferred-specialty-3/"},
    {"title":"NRMP: U.S. MD Seniors, 2026","url":"https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-u-s-md-seniors-who-matched-to-their-preferred-specialty-2026-main-residency-match/"},
    {"title":"NRMP: U.S. DO Seniors, 2026","url":"https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-u-s-do-seniors-who-matched-to-their-preferred-specialty-2026-main-residency-match/"},
    {"title":"NRMP: U.S. Citizen IMGs, 2026","url":"https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-u-s-citizen-international-medical-students-graduates-who-matched-to-their-preferred-specialty-2026-main-residency-match/"},
    {"title":"NRMP: Non-U.S. Citizen IMGs, 2026","url":"https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-non-u-s-citizen-international-medical-students-graduates-who-matched-to-their-preferred-specialty-2026-main-residency-match/"},
    {"title":"AAMC: 2027 ERAS Residency Timeline","url":"https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"}
  ]'::jsonb,
  'https://www.nrmp.org/match-data/2026/07/charting-outcomes-characteristics-of-applicants-who-match-to-their-preferred-specialty-3/',
  'Sources and further reading',
  true,
  '2026-09-01 13:00:00+00'::timestamptz
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  paragraph_1 = excluded.paragraph_1,
  paragraph_2 = excluded.paragraph_2,
  paragraph_3 = excluded.paragraph_3,
  paragraph_4 = excluded.paragraph_4,
  category = excluded.category,
  author_name = excluded.author_name,
  image_urls = excluded.image_urls,
  image_alt_texts = excluded.image_alt_texts,
  image_url_1 = excluded.image_url_1,
  image_url_2 = excluded.image_url_2,
  source_links = excluded.source_links,
  relevant_link = excluded.relevant_link,
  link_title = excluded.link_title,
  published = excluded.published,
  published_at = excluded.published_at,
  updated_at = now();

do $$
declare
  published_count integer;
begin
  select count(*)
  into published_count
  from public.blog_posts
  where slug = '70-publications-to-match-what-nrmp-data-means'
    and category = 'Residency Interviews'
    and published
    and published_at::date = '2026-09-01'::date
    and jsonb_array_length(source_links) = 6;

  if published_count <> 1 then
    raise exception 'Expected one published, sourced Residency Interviews article; found %', published_count;
  end if;
end;
$$;

commit;
