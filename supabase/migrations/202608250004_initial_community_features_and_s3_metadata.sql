begin;

alter table public.feature_requests
  add column image_storage_provider text not null default 'supabase'
  check (image_storage_provider in ('external', 'supabase', 's3'));

update public.feature_requests
set image_storage_provider = 'external'
where image_path is null;

alter table public.feature_requests
  add constraint feature_requests_image_storage_matches_path check (
    (image_storage_provider = 'external' and image_path is null)
    or (image_storage_provider in ('supabase', 's3') and image_path is not null)
  );

update public.feature_requests
set in_app_feature = false
where is_sample;

insert into public.feature_requests (
  id,
  user_id,
  username,
  user_name,
  user_email,
  title,
  summary,
  representative_quote,
  image_url,
  image_path,
  image_alt_text,
  image_credit_text,
  image_credit_url,
  image_storage_provider,
  review_status,
  front_page_feature,
  in_app_feature,
  featured_at,
  is_sample
) values
(
  '88e1b927-7772-42fc-bad6-73cb5a44a101',
  null,
  'amara_outcomes',
  'Dr. Amara Okafor',
  'amara.outcomes@magna-q.example',
  'Mapping referral delays in postpartum hemorrhage care',
  'During an obstetrics rotation, Amara saw how quickly a routine delivery could become an emergency when blood products, transport, and senior review were not coordinated. She developed a retrospective quality-improvement project across three referral hospitals to map where delays occur between the first warning sign and definitive treatment. Her small team is reviewing de-identified timestamps, interviewing frontline staff, and turning the findings into a practical escalation checklist for maternity units with limited resources.',
  'Good outcomes should not depend on whether the right person happened to be standing nearby.',
  'https://images.pexels.com/photos/16204144/pexels-photo-16204144.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'A doctor in a white coat reviewing research documents at a desk',
  'Sample image by Paloma Gil on Pexels',
  'https://www.pexels.com/photo/close-up-of-a-doctor-sitting-at-a-desk-and-holding-a-document-16204144/',
  'external',
  'approved',
  false,
  true,
  now() - interval '5 days',
  true
),
(
  '88e1b927-7772-42fc-bad6-73cb5a44a102',
  null,
  'mateo_peds',
  'Dr. Mateo Ruiz',
  'mateo.peds@magna-q.example',
  'Clearer asthma discharge plans for bilingual families',
  'Mateo is leading a pediatric quality project that compares how well families understand asthma action plans before and after a bilingual, picture-led discharge conversation. The project grew from a rotation where he repeatedly met parents who were committed to their child’s care but left the hospital unsure about controller medicines, rescue inhalers, or when to return. He is working with residents, interpreters, and nurses to test a short teach-back tool that can fit into a busy discharge workflow.',
  'A discharge instruction has only worked when a family can confidently use it at home.',
  'https://images.pexels.com/photos/8532860/pexels-photo-8532860.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'Two medical researchers working together with laboratory equipment',
  'Sample image by Artem Podrez on Pexels',
  'https://www.pexels.com/photo/medical-professionals-doing-research-work-inside-a-laboratory-8532860/',
  'external',
  'approved',
  false,
  true,
  now() - interval '4 days',
  true
),
(
  '88e1b927-7772-42fc-bad6-73cb5a44a103',
  null,
  'aisha_neuro',
  'Dr. Aisha Rahman',
  'aisha.neuro@magna-q.example',
  'Turning a difficult neurology rotation into a peer teaching series',
  'After initially struggling with neurologic localization, Aisha began drawing one-page case maps after every call shift. Those notes became a six-session peer teaching series built around real clinical reasoning: where the lesion is, which finding changes the differential, and what must not be missed overnight. Junior students now work through the cases before meeting a resident facilitator, and Aisha is collecting anonymous confidence scores and reasoning errors to improve the next version of the series.',
  'The rotation that challenged me most became the one I was proudest to help others enter.',
  'https://images.pexels.com/photos/6129198/pexels-photo-6129198.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'A physician reading clinical documents in a hospital corridor',
  'Sample image by RDNE Stock project on Pexels',
  'https://www.pexels.com/photo/a-doctor-reading-a-document-6129198/',
  'external',
  'approved',
  false,
  true,
  now() - interval '3 days',
  true
),
(
  '88e1b927-7772-42fc-bad6-73cb5a44a104',
  null,
  'daniel_global',
  'Dr. Daniel Mensah',
  'daniel.global@magna-q.example',
  'A weekend mobile clinic built around continuity, not one-off care',
  'Daniel joined a junior-doctor outreach team serving communities that had limited access to blood-pressure checks, vaccinations, and medication review. Proud of the clinical work but concerned about follow-up, he helped redesign the event around continuity: every patient received a simple record, abnormal results were assigned to a named clinic contact, and local health workers received the same referral list. The team is now measuring how many patients with new hypertension reach follow-up care within thirty days.',
  'Community medicine earns trust when we come back for the result, not only for the photograph.',
  'https://images.pexels.com/photos/11268957/pexels-photo-11268957.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'A young medical professional wearing a stethoscope during community outreach',
  'Sample image by Ferdous Hasan on Pexels',
  'https://www.pexels.com/photo/doctor-on-a-street-in-winter-11268957/',
  'external',
  'approved',
  false,
  true,
  now() - interval '2 days',
  true
),
(
  '88e1b927-7772-42fc-bad6-73cb5a44a105',
  null,
  'leila_em',
  'Dr. Leila Haddad',
  'leila.em@magna-q.example',
  'The Night Shift Lab: safer handoffs through simulation',
  'Leila organized an evening simulation event after noticing that junior doctors were taught individual emergencies but rarely practiced carrying several unstable patients through a handoff. Teams managed a deteriorating sepsis case, an unexpected airway problem, and competing ward calls before giving a structured sign-out. Faculty observers used a supportive checklist rather than a score, and participants left with specific phrases for escalating uncertainty. Leila is preparing an open facilitator pack so other hospitals can run the session locally.',
  'A safe handoff is not a memory test; it is a clinical skill we can rehearse together.',
  'https://images.pexels.com/photos/8942632/pexels-photo-8942632.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'Two emergency medical professionals discussing their work beside an ambulance',
  'Sample image by Mikhail Nilov on Pexels',
  'https://www.pexels.com/photo/people-in-white-uniform-having-conversation-8942644/',
  'external',
  'approved',
  false,
  true,
  now() - interval '1 day',
  true
),
(
  '88e1b927-7772-42fc-bad6-73cb5a44a106',
  null,
  'noah_micro',
  'Dr. Noah Kim',
  'noah.micro@magna-q.example',
  'A resident-led map of antibiotic resistance on the wards',
  'Noah is working with microbiology and internal-medicine trainees to build a quarterly, ward-level view of antibiotic resistance from routinely collected culture results. The goal is not to replace the hospital antibiogram, but to help junior clinicians see why empiric choices differ between the emergency department, intensive care, and general wards. The first teaching session pairs anonymized cases with local susceptibility patterns, and the team plans to study whether prescribing decisions improve after the intervention.',
  'Stewardship becomes real when local data is understandable at the bedside.',
  'https://images.pexels.com/photos/8442808/pexels-photo-8442808.jpeg?auto=compress&cs=tinysrgb&w=1600',
  null,
  'A medical researcher in protective equipment examining a laboratory sample',
  'Sample image by Pavel Danilyuk on Pexels',
  'https://www.pexels.com/photo/side-view-of-a-doctor-holding-an-injection-8442885/',
  'external',
  'approved',
  false,
  true,
  now(),
  true
)
on conflict (id) do update set
  username = excluded.username,
  user_name = excluded.user_name,
  user_email = excluded.user_email,
  title = excluded.title,
  summary = excluded.summary,
  representative_quote = excluded.representative_quote,
  image_url = excluded.image_url,
  image_path = excluded.image_path,
  image_alt_text = excluded.image_alt_text,
  image_credit_text = excluded.image_credit_text,
  image_credit_url = excluded.image_credit_url,
  image_storage_provider = excluded.image_storage_provider,
  review_status = excluded.review_status,
  front_page_feature = excluded.front_page_feature,
  in_app_feature = excluded.in_app_feature,
  featured_at = excluded.featured_at,
  is_sample = excluded.is_sample;

commit;
