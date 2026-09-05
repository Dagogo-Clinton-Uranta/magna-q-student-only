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
  'day-in-the-life-internal-medicine-resident',
  'Inside the Ward: A Day in the Life of an Internal Medicine Resident',
  'From early sign-out and patient rounds to discharge planning, continuity clinic, and night float, one resident’s experience shows why Internal Medicine is as much about coordination and communication as diagnosis.',
  concat_ws(
    E'\n\n',
    $article$At 6:15 a.m., while much of the hospital is still quiet, Dr. Maya Bennett begins an inpatient day by receiving sign-out from the overnight team. Maya is a fictional name, and the institutions, locations, biographical details, and other identifying information in this article have been changed or generalized. For an intern, the first hours may include reviewing overnight events, checking new laboratory and imaging results, examining each assigned patient, updating the problem list, and beginning notes before rounds. A senior resident may arrive closer to 7:00, review the whole service, identify the sickest patients, and make sure the interns have support. By about 8:30, the team is ready to round. These times reflect one resident’s account rather than a universal schedule; the service, hospital, patient census, and local program design can change the day substantially.$article$,
    $article$Rounds are where Internal Medicine’s broad view becomes visible. The team connects symptoms, physiology, test results, treatment response, and the patient’s goals into one plan. Some teams walk from bedside to bedside; others begin with table rounds so residents can enter orders and review data in real time, then visit patients. The work after rounds is just as important: call consultants, reassess unstable patients, explain decisions to families, complete documentation, follow results, and prepare safe discharges. A hospitalist team also works closely with nurses, pharmacists, social workers, therapists, and case managers. A patient may be medically ready to leave but still need rehabilitation, affordable medication, transport, home support, or insurance approval. The resident is therefore part diagnostician, part communicator, and part project manager, responsible for keeping a complex plan coherent.$article$,
    $article$Not every day is an inpatient day. In an “X+Y” schedule, residents alternate blocks of hospital service with dedicated ambulatory time; Maya’s fictionalized program uses a four-week inpatient and two-week outpatient rhythm. During ambulatory blocks, a typical clinic day may run from roughly 8:30 a.m. to 5:00 p.m. Residents follow a continuity panel across training, learning not only diagnoses but also each patient’s history, priorities, family context, and response to treatment. Night float reverses the rhythm: the resident receives admissions from the emergency department, manages overnight changes, and responds with the hospital team when urgent events occur. Weekend patterns, shift lengths, and clinic structures vary widely, so applicants should ask each program how inpatient blocks, continuity clinic, night coverage, days off, and backup systems actually work. Current ACGME standards require longitudinal team-based continuity experience and substantial inpatient and outpatient training; they also cap clinical and educational work at 80 hours per week averaged over four weeks.$article$,
    $article$What makes the work sustainable is not pretending it is easy. Maya describes the appeal as caring for the whole adult patient, learning from subspecialists, and staying involved from diagnostic uncertainty through discharge. The difficult parts include fatigue, loss, administrative work, prior authorizations, and the temptation to let every new project consume the little time left outside the hospital. Her advice is to protect exercise, relationships, and other sources of identity as priorities rather than rewards; learn to say, “I do not have the bandwidth to give that project the time it deserves”; and choose opportunities that support a genuine career direction. The best clinicians she has observed are also willing to say, “I don’t know—let’s look it up together.” For students considering Internal Medicine, the clearest test is direct experience: notice whether you enjoy complex reasoning, team-based care, long-term responsibility, and the social realities that shape whether a medical plan can actually work.$article$
  ),
  $article$At 6:15 a.m., while much of the hospital is still quiet, Dr. Maya Bennett begins an inpatient day by receiving sign-out from the overnight team. Maya is a fictional name, and the institutions, locations, biographical details, and other identifying information in this article have been changed or generalized. For an intern, the first hours may include reviewing overnight events, checking new laboratory and imaging results, examining each assigned patient, updating the problem list, and beginning notes before rounds. A senior resident may arrive closer to 7:00, review the whole service, identify the sickest patients, and make sure the interns have support. By about 8:30, the team is ready to round. These times reflect one resident’s account rather than a universal schedule; the service, hospital, patient census, and local program design can change the day substantially.$article$,
  $article$Rounds are where Internal Medicine’s broad view becomes visible. The team connects symptoms, physiology, test results, treatment response, and the patient’s goals into one plan. Some teams walk from bedside to bedside; others begin with table rounds so residents can enter orders and review data in real time, then visit patients. The work after rounds is just as important: call consultants, reassess unstable patients, explain decisions to families, complete documentation, follow results, and prepare safe discharges. A hospitalist team also works closely with nurses, pharmacists, social workers, therapists, and case managers. A patient may be medically ready to leave but still need rehabilitation, affordable medication, transport, home support, or insurance approval. The resident is therefore part diagnostician, part communicator, and part project manager, responsible for keeping a complex plan coherent.$article$,
  $article$Not every day is an inpatient day. In an “X+Y” schedule, residents alternate blocks of hospital service with dedicated ambulatory time; Maya’s fictionalized program uses a four-week inpatient and two-week outpatient rhythm. During ambulatory blocks, a typical clinic day may run from roughly 8:30 a.m. to 5:00 p.m. Residents follow a continuity panel across training, learning not only diagnoses but also each patient’s history, priorities, family context, and response to treatment. Night float reverses the rhythm: the resident receives admissions from the emergency department, manages overnight changes, and responds with the hospital team when urgent events occur. Weekend patterns, shift lengths, and clinic structures vary widely, so applicants should ask each program how inpatient blocks, continuity clinic, night coverage, days off, and backup systems actually work. Current ACGME standards require longitudinal team-based continuity experience and substantial inpatient and outpatient training; they also cap clinical and educational work at 80 hours per week averaged over four weeks.$article$,
  $article$What makes the work sustainable is not pretending it is easy. Maya describes the appeal as caring for the whole adult patient, learning from subspecialists, and staying involved from diagnostic uncertainty through discharge. The difficult parts include fatigue, loss, administrative work, prior authorizations, and the temptation to let every new project consume the little time left outside the hospital. Her advice is to protect exercise, relationships, and other sources of identity as priorities rather than rewards; learn to say, “I do not have the bandwidth to give that project the time it deserves”; and choose opportunities that support a genuine career direction. The best clinicians she has observed are also willing to say, “I don’t know—let’s look it up together.” For students considering Internal Medicine, the clearest test is direct experience: notice whether you enjoy complex reasoning, team-based care, long-term responsibility, and the social realities that shape whether a medical plan can actually work.$article$,
  'Residency Interviews',
  'Magna-Q Editorial Team',
  array[
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80'
  ],
  array[
    'Quiet hospital corridor at the beginning of a resident shift',
    'Physician reviewing a patient care plan on a laptop'
  ],
  'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80',
  'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80',
  '[
    {"title":"ACGME: 2026 Program Requirements for Graduate Medical Education in Internal Medicine","url":"https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/140_internalmedicine_2026.pdf"},
    {"title":"ACGME: 2026 Common Program Requirements for Residency","url":"https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/cprresidency_2026_feb_revision.pdf"},
    {"title":"ACGME: Internal Medicine documents and resources","url":"https://www.acgme.org/specialties/internal-medicine/documents-and-resources/"}
  ]'::jsonb,
  'https://www.acgme.org/globalassets/pfassets/programrequirements/2026-prs/140_internalmedicine_2026.pdf',
  'Sources and further reading',
  true,
  '2026-09-04 18:00:00+00'::timestamptz
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
  where slug = 'day-in-the-life-internal-medicine-resident'
    and category = 'Residency Interviews'
    and author_name = 'Magna-Q Editorial Team'
    and published
    and published_at::date = '2026-09-04'::date
    and jsonb_array_length(source_links) = 3
    and cardinality(image_urls) = 2
    and paragraph_1 like '%fictional name%';

  if published_count <> 1 then
    raise exception 'Expected one published, anonymized Internal Medicine resident article; found %', published_count;
  end if;
end;
$$;

commit;
