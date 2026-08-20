begin;

create table public.blog_posts (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 5 and 180),
  excerpt text not null check (char_length(btrim(excerpt)) between 20 and 1200),
  content text not null check (char_length(btrim(content)) between 100 and 30000),
  category text not null check (category in ('Step 1', 'Step 2 CK', 'Step 3', 'Residency Interviews')),
  author_name text not null default 'MediNexus Editorial Team',
  image_urls text[] not null check (cardinality(image_urls) between 1 and 4),
  image_alt_texts text[] not null check (cardinality(image_alt_texts) = cardinality(image_urls)),
  source_links jsonb not null default '[]'::jsonb check (jsonb_typeof(source_links) = 'array'),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_published_date_idx
on public.blog_posts(published, published_at desc);

create trigger blog_posts_updated before update on public.blog_posts
for each row execute function public.set_updated_at();

alter table public.blog_posts enable row level security;
create policy blog_posts_published_read on public.blog_posts
for select to authenticated using (published);
create policy blog_posts_admin_all on public.blog_posts
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');
grant select, insert, update, delete on public.blog_posts to authenticated;

insert into public.blog_posts(
  slug, title, excerpt, content, category, image_urls, image_alt_texts,
  source_links, published, published_at
) values
(
  'step-1-after-pass-fail',
  'Step 1 After Pass/Fail: What Changed—and What Still Matters',
  'Step 1 score reporting changed permanently in January 2022, but the exam did not become unimportant. The better response is to build durable foundations without turning a pass/fail result into permission to study superficially.',
  E'Step 1 score reporting changed permanently in January 2022, but the exam did not become unimportant. The better response is to build durable foundations without turning a pass/fail result into permission to study superficially.\n\nThe official transition means examinations taken on or after January 26, 2022 are reported only as pass or fail. That removed the old pressure to chase a three-digit Step 1 score, but it did not remove the clinical-science foundation that later supports Step 2 CK, clerkships, and residency. A safe pass should be the minimum outcome; genuine understanding remains the useful outcome.\n\nFor international graduates, a balanced plan connects mechanisms to clinical decisions. Review why a disease happens, then practice recognizing how it presents and what should happen next. Use question-bank errors to identify weak systems and return to targeted content rather than repeatedly rereading everything.\n\nThe practical lesson is simple: prepare to pass confidently, protect your wellbeing, and use Step 1 preparation to make the next stage of training easier. Always verify current policies and passing standards on the official USMLE website before scheduling.',
  'Step 1',
  array[
    'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=80'
  ],
  array['Medical student reviewing anatomy study materials','Students learning together around a laboratory table'],
  '[{"title":"USMLE examination results and scoring","url":"https://www.usmle.org/scores-transcripts/examination-results-and-scoring"}]'::jsonb,
  true, now() - interval '5 days'
),
(
  'step-2-ck-new-testing-rhythm',
  'Step 2 CK in 2026: Adapting to a New Testing Rhythm',
  'Step 2 CK continues to test clinical knowledge in a single long day, but the 2026 delivery update changes the rhythm of that day. Shorter blocks make familiarity with the correct practice interface part of sensible preparation.',
  E'Step 2 CK continues to test clinical knowledge in a single long day, but the 2026 delivery update changes the rhythm of that day. Shorter blocks make familiarity with the correct practice interface part of sensible preparation.\n\nFor examinations on or after May 7, 2026, the official format uses sixteen 30-minute blocks rather than eight 60-minute blocks. The overall nine-hour session and maximum item count remain broadly familiar, while breaks and tutorial timing change. Candidates should use the official interactive experience that matches their test date.\n\nThis should influence rehearsal more than medical content. Practice resetting your attention at the start of each shorter block, making decisions without carrying frustration from the previous block, and using breaks deliberately. Build full-day stamina, but also practice focused 30-minute sets.\n\nStep 2 CK rewards application: choosing the next step, identifying urgent risks, and distinguishing reasonable care from the single best answer. Track errors by reasoning pattern—not only by subject—so you can see whether the problem is knowledge, interpretation, prioritization, or timing.',
  'Step 2 CK',
  array[
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=1400&q=80'
  ],
  array['Clinician using a laptop while studying medical information','Doctor reviewing information with a stethoscope nearby'],
  '[{"title":"Official Step 2 CK exam content","url":"https://www.usmle.org/step-exams/step-2-ck/step-2-ck-exam-content"},{"title":"USMLE 2026 software updates","url":"https://www.usmle.org/usmle-test-delivery-software-updates-coming-2026"}]'::jsonb,
  true, now() - interval '4 days'
),
(
  'step-3-thinking-independently',
  'Step 3: Moving From Supervised Decisions to Independent Practice',
  'Step 3 asks a different question from the earlier examinations: can you manage patients with increasing independence? Preparation becomes stronger when it combines clinical knowledge, prioritization, longitudinal management, and deliberate case-simulation practice.',
  E'Step 3 asks a different question from the earlier examinations: can you manage patients with increasing independence? Preparation becomes stronger when it combines clinical knowledge, prioritization, longitudinal management, and deliberate case-simulation practice.\n\nThe official examination spans two days. It includes multiple-choice questions and computer-based case simulations, with emphasis on the knowledge and skills needed for independent general medical care. That structure rewards candidates who can move beyond identifying a diagnosis to ordering, treating, monitoring, counseling, and arranging follow-up.\n\nCase simulations deserve their own preparation plan. Learn how the software represents time, location, orders, and patient reassessment. Practice avoiding unnecessary interventions while acting promptly on emergencies. After each case, review both missing actions and actions that added risk or wasted time.\n\nResidency schedules make preparation difficult, so use small repeatable sessions. A short question set, one case simulation, and a focused review can be more sustainable than waiting for a free weekend that never arrives.',
  'Step 3',
  array[
    'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1400&q=80'
  ],
  array['Bright hospital corridor representing clinical practice','Physician in a hospital clinical environment'],
  '[{"title":"Official Step 3 exam content","url":"https://www.usmle.org/step-exams/step-3/step-3-exam-content"}]'::jsonb,
  true, now() - interval '3 days'
),
(
  'new-york-residency-interview-fit',
  'Interviewing in New York: Showing You Understand the Training Environment',
  'A strong New York residency interview answer goes beyond saying that the city is exciting. Programs want evidence that you have thought seriously about their patients, pace, teams, commute, support system, and the kind of physician you hope to become.',
  E'A strong New York residency interview answer goes beyond saying that the city is exciting. Programs want evidence that you have thought seriously about their patients, pace, teams, commute, support system, and the kind of physician you hope to become.\n\nResearch the actual program rather than relying on the state or city name. A large public hospital, a community-based program, and a university referral center can offer very different experiences within the same metropolitan area. Ask what responsibility residents gain over time, how teams support one another on difficult services, and which patient populations shape the curriculum.\n\nConnect those answers to your own history. If you have worked in crowded or resource-variable settings, describe what that taught you about prioritization and teamwork. If diverse communities motivate you, use a specific patient or service experience rather than a general claim.\n\nFit is a two-way assessment. Consider cost, commuting, call structure, family needs, and the support available to international graduates outside the formal interview. During the interview, focus on thoughtful questions that help both sides understand how you would contribute and grow.',
  'Residency Interviews',
  array[
    'https://images.unsplash.com/photo-1522083165195-3424ed129620?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1400&q=80'
  ],
  array['New York City skyline and urban training environment','Professional conversation in a city setting'],
  '[{"title":"NRMP Match Codes of Conduct","url":"https://www.nrmp.org/policy-topic/codes-of-conduct/"}]'::jsonb,
  true, now() - interval '2 days'
),
(
  'texas-residency-interview-questions',
  'Interviewing in Texas: Ask Questions That Reveal the Program',
  'Texas contains major academic centers, border-health settings, large urban systems, and programs serving wide rural areas. Your interview preparation should therefore be program-specific, not built around assumptions about one enormous state.',
  E'Texas contains major academic centers, border-health settings, large urban systems, and programs serving wide rural areas. Your interview preparation should therefore be program-specific, not built around assumptions about one enormous state.\n\nStart with the program’s clinical footprint. Where do residents rotate? How far apart are sites? Which communities do they serve? What problems do graduates feel especially prepared to manage? These questions produce a clearer picture than asking whether a program is simply “busy” or “supportive.”\n\nWhen explaining your interest, link geography to training goals. You might value high-volume emergency care, continuity in an underserved community, exposure to Spanish-speaking populations, or a pathway in academic medicine. Choose only reasons that are genuinely yours and support them with your prior choices.\n\nUse conversations with residents to understand daily life, including transport, housing, heat, call, and the practical consequences of rotating across sites. Those details matter, but the formal interview is strongest when it centers on contribution, learning, mentorship, and patient care.',
  'Residency Interviews',
  array[
    'https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=1400&q=80'
  ],
  array['Medical team discussing patient care','Healthcare professional in a clinical training setting'],
  '[{"title":"NRMP Match Codes of Conduct","url":"https://www.nrmp.org/policy-topic/codes-of-conduct/"}]'::jsonb,
  true, now() - interval '1 day'
),
(
  'california-virtual-interview-presence',
  'California and Virtual Interviews: Building Presence Across a Screen',
  'Whether a California program interviews virtually or in person, your goal is the same: create a professional, two-way conversation. Virtual interviews simply require more deliberate preparation for attention, sound, framing, and conversational warmth.',
  E'Whether a California program interviews virtually or in person, your goal is the same: create a professional, two-way conversation. Virtual interviews simply require more deliberate preparation for attention, sound, framing, and conversational warmth.\n\nTest your connection, microphone, camera height, lighting, and display name well before interview day. Keep the background quiet and neutral, close distracting applications, and place brief prompts near the camera rather than reading complete scripts. A rehearsed idea can sound natural; a memorized paragraph usually does not.\n\nThe NRMP encourages professional, ethical communication and processes that promote fairness and transparency. Treat every interaction—including informal sessions and messages—as part of that professional environment. Never record an interview, and avoid communication intended to pressure a program or discover ranking intentions.\n\nCalifornia programs vary enormously in mission and setting. Ask about the patient community, resident autonomy, mentorship, housing realities, and how the program supports trainees across its clinical sites. Your questions should show careful research while still leaving room for a genuine conversation.',
  'Residency Interviews',
  array[
    'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=1400&q=80',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1400&q=80'
  ],
  array['Professional participating in a video interview','Bright professional workspace prepared for an interview'],
  '[{"title":"NRMP Match Codes of Conduct","url":"https://www.nrmp.org/policy-topic/codes-of-conduct/"}]'::jsonb,
  true, now()
)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  category = excluded.category,
  image_urls = excluded.image_urls,
  image_alt_texts = excluded.image_alt_texts,
  source_links = excluded.source_links,
  published = excluded.published,
  published_at = excluded.published_at;

commit;
