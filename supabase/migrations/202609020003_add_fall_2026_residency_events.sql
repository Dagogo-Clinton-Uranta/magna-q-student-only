begin;

-- Official program and institution pages were checked on 2026-09-02. Keep the
-- source-provided institution/specialty labels even when an institution-wide
-- event cannot be accurately associated with every program in the directory.
insert into public.residency_events (
  event_type,
  event_name,
  event_date,
  published_timing,
  listed_institution_name,
  listed_specialty,
  listed_acgme_id,
  start_time,
  end_time,
  time_zone,
  format,
  platform_or_location,
  event_scope,
  who_can_attend,
  program_leadership_present,
  residents_present,
  qa_available,
  registration_required,
  registration_url,
  event_url,
  status,
  source_verified,
  source_type,
  source_url,
  date_checked,
  notes
)
values
  (
    'virtual_information_session',
    'Pediatric Residency Virtual Information Session',
    date '2026-09-01',
    null,
    'University of Minnesota Medical School',
    'Pediatrics',
    null,
    time '18:00',
    time '20:00',
    'CT',
    'virtual',
    'Zoom',
    'program',
    'Prospective applicants',
    true,
    null,
    true,
    false,
    null,
    'https://med.umn.edu/pediatrics/education/residency-program/applicants',
    'completed',
    true,
    'official_program_page',
    'https://med.umn.edu/pediatrics/education/residency-program/applicants',
    date '2026-09-02',
    'General program overview followed by breakout rooms for the Rural Medicine Pathway, Physician Scientist Pathway, and international medical school graduate applicants.'
  ),
  (
    'virtual_open_house',
    'Adult & Pediatric Neurology Residency Virtual Open House',
    date '2026-09-03',
    null,
    'Mount Sinai Health System',
    'Adult Neurology and Pediatric Neurology',
    null,
    time '18:00',
    time '19:00',
    'ET',
    'virtual',
    'Zoom',
    'multiple_programs',
    'Postdocs, students, and prospective students',
    true,
    null,
    true,
    true,
    'https://mssm.zoom.us/meeting/register/cF7T63egRrKiaimUz3-fPg#/registration',
    'https://events.mountsinaihealth.org/event/msh-neurology-open-house',
    'upcoming',
    true,
    'official_institution_event_page',
    'https://events.mountsinaihealth.org/event/msh-neurology-open-house',
    date '2026-09-02',
    'Meet the program directors and associate program directors, join breakout rooms, and participate in the closing Q&A.'
  ),
  (
    'virtual_information_session',
    'CU GME First Look',
    date '2026-09-10',
    null,
    'University of Colorado Anschutz Medical Campus',
    'Multiple GME programs',
    null,
    time '17:00',
    time '19:00',
    'MT',
    'virtual',
    'Virtual event; access link provided after registration',
    'institution_wide',
    'Students and residents/trainees',
    null,
    null,
    null,
    true,
    null,
    'https://calendar.cuanschutz.edu/event/cu-gme-first-look',
    'upcoming',
    true,
    'official_institution_event_page',
    'https://calendar.cuanschutz.edu/event/cu-gme-first-look',
    date '2026-09-02',
    'Meet representatives and explore residency opportunities across CU Anschutz. Diagnostic Radiology and Integrated Interventional Radiology have confirmed dedicated breakout participation. The official page also lists a second session on September 24, 2026.'
  ),
  (
    'virtual_open_house',
    'Urology Residency Virtual Open House',
    date '2026-09-14',
    null,
    'University of Michigan Medical School',
    'Urology',
    null,
    time '20:00',
    time '21:00',
    'ET',
    'virtual',
    'Zoom',
    'program',
    'Medical students',
    true,
    true,
    true,
    false,
    null,
    'https://medschool.umich.edu/events/urology-residency-virtual-open-house/2026-09-14',
    'upcoming',
    true,
    'official_program_event_page',
    'https://medschool.umich.edu/events/urology-residency-virtual-open-house/2026-09-14',
    date '2026-09-02',
    'Applicants can learn about the residency, ask questions, and meet faculty and current residents.'
  ),
  (
    'virtual_open_house',
    'U of U Anesthesiology Residency Virtual Open House',
    date '2026-09-16',
    null,
    'University of Utah School of Medicine',
    'Anesthesiology',
    null,
    time '17:30',
    time '18:30',
    'MT',
    'virtual',
    'Zoom',
    'program',
    'Residency applicants',
    true,
    true,
    true,
    true,
    null,
    'https://medicine.utah.edu/anesthesiology/news-events',
    'upcoming',
    true,
    'official_program_page',
    'https://medicine.utah.edu/anesthesiology/news-events',
    date '2026-09-02',
    'Program directors, faculty, and residents will participate; applicant questions are encouraged. The official page publishes the start time and RSVP link; the supplied event details publish the 6:30 PM end time.'
  ),
  (
    'virtual_open_house',
    'Ophthalmology Residency Virtual Open House',
    date '2026-09-16',
    null,
    'Loyola University Medical Center',
    'Ophthalmology',
    null,
    time '19:00',
    time '20:00',
    'CT',
    'virtual',
    'Virtual',
    'program',
    'Prospective ophthalmology applicants',
    true,
    null,
    true,
    true,
    null,
    'https://www.loyolamedicine.org/gme/residencies/ophthalmology',
    'upcoming',
    true,
    'official_program_page',
    'https://www.loyolamedicine.org/gme/residencies/ophthalmology',
    date '2026-09-02',
    'A second virtual open house is planned for late September or early October; its date is pending and is not represented as a separate event yet.'
  ),
  (
    'gme_open_house',
    'Graduate Medical Education Open House',
    date '2026-10-09',
    'October 9, 2026; time to be announced',
    'Children''s Mercy Kansas City',
    'Pediatrics and pediatric GME programs',
    null,
    null,
    null,
    'CT',
    'in_person',
    'Children''s Mercy Kansas City',
    'institution_wide',
    'Invited applicants',
    null,
    null,
    null,
    null,
    null,
    'https://www.childrensmercy.org/professional-education/training-programs/residency/',
    'upcoming',
    true,
    'official_institution_program_page',
    'https://www.childrensmercy.org/professional-education/training-programs/residency/',
    date '2026-09-02',
    'Invited applicants can visit the hospital and city and experience the training environment. One night of lodging is paid, and participation will not affect ranking. Additional information is provided with the interview invitation.'
  )
on conflict (event_name, event_date, source_url) do update
set
  event_type = excluded.event_type,
  published_timing = excluded.published_timing,
  listed_institution_name = excluded.listed_institution_name,
  listed_specialty = excluded.listed_specialty,
  listed_acgme_id = excluded.listed_acgme_id,
  start_time = excluded.start_time,
  end_time = excluded.end_time,
  time_zone = excluded.time_zone,
  format = excluded.format,
  platform_or_location = excluded.platform_or_location,
  event_scope = excluded.event_scope,
  who_can_attend = excluded.who_can_attend,
  program_leadership_present = excluded.program_leadership_present,
  residents_present = excluded.residents_present,
  qa_available = excluded.qa_available,
  registration_required = excluded.registration_required,
  registration_url = excluded.registration_url,
  event_url = excluded.event_url,
  status = excluded.status,
  source_verified = excluded.source_verified,
  source_type = excluded.source_type,
  date_checked = excluded.date_checked,
  notes = excluded.notes,
  updated_at = now();

-- Link program-specific events without relying on hard-coded UUIDs. Broad GME
-- events stay unlinked so their institution-wide scope is not misrepresented.
with event_program_matches (source_url, program_name, specialty) as (
  values
    (
      'https://med.umn.edu/pediatrics/education/residency-program/applicants',
      'University of Minnesota Program',
      'Pediatrics'
    ),
    (
      'https://events.mountsinaihealth.org/event/msh-neurology-open-house',
      'Icahn School of Medicine at Mount Sinai Program',
      'Neurology'
    ),
    (
      'https://events.mountsinaihealth.org/event/msh-neurology-open-house',
      'Icahn School of Medicine at Mount Sinai Program',
      'Child Neurology'
    ),
    (
      'https://medschool.umich.edu/events/urology-residency-virtual-open-house/2026-09-14',
      'University of Michigan Health System Program',
      'Urology'
    ),
    (
      'https://medicine.utah.edu/anesthesiology/news-events',
      'University of Utah Health Program',
      'Anesthesiology'
    ),
    (
      'https://www.loyolamedicine.org/gme/residencies/ophthalmology',
      'Loyola University Medical Center Program',
      'Ophthalmology'
    )
)
insert into public.residency_event_programs (
  event_id,
  residency_program_id,
  match_method,
  match_confidence
)
select
  event.id,
  program.id,
  'official_institution_and_specialty',
  1.000
from event_program_matches as match
join public.residency_events as event on event.source_url = match.source_url
join public.residency_programs as program
  on program.program_name = match.program_name
 and program.specialty = match.specialty
on conflict (event_id, residency_program_id) do update
set
  match_method = excluded.match_method,
  match_confidence = excluded.match_confidence;

insert into public.residency_event_research_status (
  residency_program_id,
  search_status,
  last_checked_at,
  search_notes
)
select distinct
  link.residency_program_id,
  'found_upcoming',
  timestamptz '2026-09-02 00:00:00+00',
  'Official program or institution event page checked 2026-09-02.'
from public.residency_event_programs as link
join public.residency_events as event on event.id = link.event_id
where event.source_url in (
  'https://events.mountsinaihealth.org/event/msh-neurology-open-house',
  'https://medschool.umich.edu/events/urology-residency-virtual-open-house/2026-09-14',
  'https://medicine.utah.edu/anesthesiology/news-events',
  'https://www.loyolamedicine.org/gme/residencies/ophthalmology'
)
on conflict (residency_program_id) do update
set
  search_status = excluded.search_status,
  last_checked_at = excluded.last_checked_at,
  search_notes = excluded.search_notes;

commit;
