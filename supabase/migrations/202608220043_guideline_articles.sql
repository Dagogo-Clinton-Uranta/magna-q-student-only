begin;

create function public.valid_guideline_sections(value jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  section jsonb;
begin
  if jsonb_typeof(value) <> 'array' or jsonb_array_length(value) = 0 then
    return false;
  end if;

  for section in select item from jsonb_array_elements(value) as items(item)
  loop
    if jsonb_typeof(section) <> 'object'
      or jsonb_typeof(section->'number') <> 'number'
      or (section->>'number')::integer < 1
      or jsonb_typeof(section->'title') <> 'string'
      or char_length(btrim(section->>'title')) = 0
      or jsonb_typeof(section->'bullets') <> 'array'
      or jsonb_array_length(section->'bullets') = 0
      or exists (
        select 1
        from jsonb_array_elements(section->'bullets') as bullets(item)
        where jsonb_typeof(item) <> 'string' or char_length(btrim(item #>> '{}')) = 0
      )
      or (
        section ? 'introduction'
        and (
          jsonb_typeof(section->'introduction') <> 'string'
          or char_length(btrim(section->>'introduction')) = 0
        )
      )
      or (
        section ? 'links'
        and jsonb_typeof(section->'links') <> 'array'
      )
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create function public.valid_guideline_media(value jsonb)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  asset jsonb;
begin
  if value is null then return true; end if;
  if jsonb_typeof(value) <> 'array' then return false; end if;

  for asset in select item from jsonb_array_elements(value) as assets(item)
  loop
    if jsonb_typeof(asset) <> 'object'
      or jsonb_typeof(asset->'sectionNumber') <> 'number'
      or (asset->>'sectionNumber')::integer < 1
      or asset->>'type' not in ('image', 'video')
      or coalesce(asset->>'s3Url', '') !~ '^https://'
      or char_length(btrim(coalesce(asset->>'altText', ''))) = 0
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create table public.guidelines (
  id uuid primary key default extensions.gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  title text not null check (char_length(btrim(title)) between 5 and 220),
  eyebrow text not null check (char_length(btrim(eyebrow)) between 3 and 80),
  summary text not null check (char_length(btrim(summary)) between 20 and 1600),
  summary_points text[] not null check (cardinality(summary_points) between 2 and 8),
  classification text not null check (
    classification in (
      'usmle-step-1',
      'usmle-step-2-ck',
      'usmle-step-3',
      'residency-and-matching',
      'residency-interviews',
      'general'
    )
  ),
  preamble text[] not null check (cardinality(preamble) between 1 and 8),
  sections jsonb not null check (public.valid_guideline_sections(sections)),
  conclusion text[] not null check (cardinality(conclusion) between 1 and 8),
  s3_media jsonb check (public.valid_guideline_media(s3_media)),
  source_links jsonb not null default '[]'::jsonb check (jsonb_typeof(source_links) = 'array'),
  source_document_name text,
  author_name text not null default 'Magna-Q Editorial Team',
  reviewed_at date not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not published or published_at is not null)
);

comment on table public.guidelines is
  'Database-backed, consistently structured guideline articles for student learning sections.';
comment on column public.guidelines.sections is
  'Ordered numbered sections; every section has a title and readable bullet-point paragraphs.';
comment on column public.guidelines.s3_media is
  'Optional image/video S3 assets linked to a section by sectionNumber.';
comment on column public.guidelines.classification is
  'Routes each guideline to the appropriate USMLE or residency learning section.';

create index guidelines_classification_published_date_idx
on public.guidelines(classification, published, published_at desc);

create trigger guidelines_updated before update on public.guidelines
for each row execute function public.set_updated_at();

alter table public.guidelines enable row level security;

create policy guidelines_published_read on public.guidelines
for select to authenticated using (published);

create policy guidelines_admin_all on public.guidelines
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

grant select, insert, update, delete on public.guidelines to authenticated;

insert into public.guidelines (
  slug,
  title,
  eyebrow,
  summary,
  summary_points,
  classification,
  preamble,
  sections,
  conclusion,
  s3_media,
  source_links,
  source_document_name,
  reviewed_at,
  published,
  published_at
) values (
  'residency-program-signaling-strategy-2027',
  'Residency Program Signaling: A Practical Strategy Guide for the 2027 ERAS Season',
  '2027 residency application strategy',
  'Learn what program signals communicate, how signal allowances differ by specialty, and how to build a balanced list that combines genuine interest with realistic program fit.',
  array[
    'Understand what a program signal can—and cannot—do for your application.',
    'Build a Reach, Target and Safer-fit portfolio before assigning signals.',
    'Use gold and silver tiers deliberately in specialties that offer both.',
    'Review the published 2027 signal allowances for participating specialties.',
    'Apply IMG-specific checks for visa sponsorship, graduation year and USMLE requirements.'
  ],
  'residency-and-matching',
  array[
    $preamble$Program signals let you express genuine interest in selected residency programs when you submit your application. Because every participating specialty limits how many signals you can use, each choice should combine authentic preference, confirmed eligibility and a credible fit between your application and the program.$preamble$,
    $preamble$This guide turns the supplied 2027 strategy document into a practical workflow. It is educational guidance, not a promise of an interview or a replacement for current AAMC, ECFMG, NRMP, specialty-advisor or individual-program instructions.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "What a residency program signal means",
      "introduction": "A signal tells a participating program that you have genuine interest at the time you submit your application. It is one part of holistic application review, particularly when programs decide whom to interview.",
      "bullets": [
        "A signal is not a Match commitment. It does not require you to rank that program first, and your preferences may change after interviews.",
        "A signal cannot override eligibility rules such as exam requirements, graduation-year limits, visa policy or missing application materials.",
        "A signal does not guarantee an interview; the complete application and applicant-program fit still control the decision.",
        "Signals are separate from the NRMP rank-order list. Signaling happens during application review, while ranking happens after interviews.",
        "Signals are useful because they are scarce. A limited allocation makes your expression of interest more informative."
      ]
    },
    {
      "number": 2,
      "title": "Why signaling has become important",
      "introduction": "Programs often receive far more applications than they can interview, making it difficult to distinguish deliberate interest from broad application volume.",
      "bullets": [
        "Programs have limited interview capacity, so even strong applicants can be crowded out of a very large pool.",
        "Signals reduce uncertainty by showing that you intentionally selected the program rather than merely adding another application.",
        "AAMC reported that 96% of responding programs in its 2026-season survey used signals when deciding whom to interview, and 90% said signals helped identify applicants they might otherwise have overlooked.",
        "Interview invitation rates are generally higher for signaled applicants. In two-tier systems, gold generally outperformed silver and both outperformed no signal, although the size of the effect varies.",
        "Do not repeat a specialty- or program-specific statistic as if it applies nationally. Signal use differs across specialties, programs and MD, DO and IMG applicant groups."
      ]
    },
    {
      "number": 3,
      "title": "Treat a signal as an amplifier",
      "introduction": "A signal amplifies an already credible application-program match. It directs attention to your application; it does not create qualifications that are absent.",
      "bullets": [
        "Ask which programs you genuinely like, but also ask where your profile gives the signal a realistic chance to convert into an interview.",
        "Consider whether you could honestly rank the program highly if the interview confirms what your research suggests.",
        "The strongest targets combine real interest with credible fit.",
        "A good signal does not replace a strong application; it only amplifies it."
      ]
    },
    {
      "number": 4,
      "title": "Build the list before spending a signal",
      "introduction": "Treat signal allocation like a portfolio decision: create a longlist, research it, score it consistently and only then assign signals.",
      "bullets": [
        "Confirm hard eligibility first: specialty and track, application service, graduation-year rules, USMLE or COMLEX requirements, ECFMG requirements, attempts, clinical experience and visa sponsorship.",
        "Assess personal fit: location, support network, cost of living, patient population, program setting, size, fellowship options, call structure, research expectations, resident culture and career goals.",
        "Assess profile fit using reliable information about exams, clinical experience, research, publications, letters, specialty commitment, leadership and U.S. experience where relevant.",
        "Record genuine connections such as an away rotation, institutional research, geographic ties, partner or family needs, previous education, a mentor connection or a distinctive training goal.",
        "Classify each program as Reach, Target or Safer-fit. Safer-fit never means guaranteed; it means comparatively well aligned and somewhere you would genuinely train.",
        "Score programs before submission day so emotion and prestige do not make the final decision for you."
      ]
    },
    {
      "number": 5,
      "title": "Use a consistent scoring framework",
      "introduction": "The suggested weights below are a planning tool, not an AAMC formula. Adjust them to your own priorities, but apply the same reasoning to every program.",
      "bullets": [
        "Eligibility and screening fit is a pass/fail gate. If you clearly fail a mandatory requirement, do not expect a signal to override the filter.",
        "Career and training fit — 25%: clinical exposure, procedures, patient population, fellowship preparation, research and practice style.",
        "Applicant-profile fit — 25%: whether your academic and clinical profile plausibly resembles applicants the program considers.",
        "Personal and geographic fit — 15%: whether you would genuinely live and train there, including family, partner or community ties.",
        "Demonstrated connection — 15%: rotations, research, prior institutional experience, mentorship or meaningful networking.",
        "Mission and values fit — 10%: a specific explanation of how the program's mission, population or educational model fits you.",
        "Signal leverage — 10%: whether the signal adds useful information after considering the program's own guidance.",
        "For IMGs who require sponsorship, visa compatibility is a hard gate. Write a one-sentence reason for every proposed signal; if it only says prestige, reconsider."
      ]
    },
    {
      "number": 6,
      "title": "Diversify Reach, Target and Safer-fit signals",
      "introduction": "Diversification protects you from using every signal on an optimistic assumption, while still leaving room for genuine ambition.",
      "bullets": [
        "Reach programs are highly desirable but less predictable because of selectivity, research expectations, applicant pool or profile differences.",
        "Target programs are programs you strongly like where your credentials, experience and goals appear reasonably aligned.",
        "Safer-fit programs are places you would happily attend where your application appears especially compatible—not programs you would refuse to rank.",
        "For a one-tier system, a possible starting point is 20–30% Reach, 50–60% Target and 20–30% Safer-fit, adjusted for your circumstances.",
        "In very competitive specialties, avoid making every signal a famous academic reach; preserve credible routes to interviews.",
        "If you have visa, geography, graduation-year, attempt or other constraints, allocate more signals to programs confirmed to accommodate them."
      ]
    },
    {
      "number": 7,
      "title": "Use gold and silver tiers differently",
      "introduction": "In two-tier systems, gold generally has stronger interview conversion than silver, while silver still performs better than no signal overall. Neither tier rescues a poor fit.",
      "bullets": [
        "Use gold for the strongest combination of personal preference and plausible program fit.",
        "Do not spend every gold signal on prestige. A selected extreme reach may be reasonable, but an all-reach gold list removes high-intensity signals from better-fitting programs.",
        "Use silver for strategic breadth across strong targets, selected reaches and programs you would be very happy to attend.",
        "Never treat silver as meaningless; national data indicate that both tiers carry information even though gold tends to perform better.",
        "Programs may interpret tiers differently. Read program websites, specialty guidance, open-house material and current FAQs rather than assuming uniform behavior."
      ]
    },
    {
      "number": 8,
      "title": "Know the 2027 signal allowances",
      "introduction": "These counts were reported in the supplied guide from AAMC's 2027 MyERAS guidance, checked August 22, 2026. Recheck AAMC and each program before submission because participation can change.",
      "bullets": [
        "Two-tier specialties: Anesthesiology — 5 gold + 10 silver; Child Neurology — 3 + 6; Dermatology — 3 + 25; Diagnostic Radiology — 6 + 9; Internal Medicine — 3 + 12; Vascular Surgery–Integrated — 3 + 12.",
        "Thirty signals: Orthopaedic Surgery and Urology.",
        "Twenty-five signals: Neurological Surgery and Otolaryngology.",
        "Twenty signals: Physical Medicine & Rehabilitation and Plastic Surgery–Integrated.",
        "Fifteen signals: General Surgery. Twelve signals: Transitional Year. Ten signals: Psychiatry.",
        "Eight signals: Interventional Radiology–Integrated and Neurology.",
        "Five signals: Family Medicine, Internal Medicine/Pediatrics, Pathology and Pediatrics.",
        "Four signals: Radiation Oncology and Thoracic Surgery–Integrated.",
        "Three signals: Internal Medicine/Medical Genetics, Pediatric Medical Genetics, Pediatrics/Psychiatry/Child & Adolescent Psychiatry and Public Health & General Preventive Medicine.",
        "Two signals: Internal Medicine/Psychiatry and Neurodevelopmental Disabilities."
      ],
      "links": [
        {
          "label": "Check current 2027 MyERAS signaling guidance",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/program-signaling-2027-myeras-application-season"
        }
      ]
    },
    {
      "number": 9,
      "title": "Adjust strategy to the number of signals",
      "introduction": "A specialty with two to five signals requires more concentration than a specialty offering twenty to thirty.",
      "bullets": [
        "Very small set, 2–5: every signal is expensive. Prioritize high interest, confirmed eligibility and defensible fit; avoid spending most on speculative reaches.",
        "Medium set, 8–15: build a diversified portfolio with meaningful reaches, a substantial target group and several safer-fit choices.",
        "Large set, 20–30: use the added breadth deliberately across competitiveness, geography and program type rather than signaling randomly.",
        "Two-tier systems: treat gold as scarce high-conviction capital and silver as wider strategic coverage."
      ]
    },
    {
      "number": 10,
      "title": "Apply the framework within your specialty",
      "introduction": "Signal counts change the shape of the list, but program-specific research remains essential in every field.",
      "bullets": [
        "Family Medicine, 5: research mission, community focus, geography and clinical interests deeply; a starting structure could be 1 Reach, 3 Targets and 1 Safer-fit.",
        "Internal Medicine, 3 gold + 12 silver: reserve gold for top choices with credible fit; use silver across academic, university-affiliated and community programs that support your goals.",
        "Anesthesiology, 5 + 10: signals may strongly shape interview selection, but training-model fit still matters and one program's exact statistics do not apply everywhere.",
        "Dermatology, 3 + 25: use the highly scarce gold tier carefully and use silver breadth to avoid a list dominated by a few elite institutions.",
        "Orthopaedic Surgery and Urology, 30: broad coverage is possible, but group choices by competitiveness, geography, program character and clinical interests. Confirm Urology-specific application and Match rules.",
        "Neurological Surgery, 25, and Plastic Surgery–Integrated, 20: signals do not replace specialty commitment, strong letters, research or academic evidence; prioritize concrete connections.",
        "PM&R, 20; Psychiatry, 10; Neurology, 8: use differences in mission, patient population, setting, subspecialty exposure, research and fellowship goals to build a balanced portfolio.",
        "Transitional Year, 12: judge schedule, electives, workload, location and compatibility with your advanced specialty—not whether the year merely appears easy."
      ]
    },
    {
      "number": 11,
      "title": "IMG applicants: verify access before interest",
      "introduction": "For an international medical graduate, a signal is most useful only after confirming that the program is accessible to your application.",
      "bullets": [
        "Verify current J-1 and H-1B sponsorship directly from the program or institutional GME source; do not rely on old forum posts.",
        "Check maximum time since medical-school graduation and whether any exceptions are explicitly described.",
        "Confirm USMLE requirements, attempt policies and whether Step 2 CK must be reported by a specific date.",
        "Check the current ECFMG certification and Pathway requirements that apply to your cycle.",
        "Distinguish whether U.S. clinical experience is required, preferred or not stated. A signal cannot erase a mandatory requirement.",
        "Use a program's IMG representation as context, not as a guarantee of an interview.",
        "State only genuine geographic ties and make them coherent with the rest of your application.",
        "Ensure the whole application explains why the specialty and program make sense for you."
      ]
    },
    {
      "number": 12,
      "title": "Home programs, away rotations and geographic ties",
      "introduction": "AAMC's 2027 guidance recommends signaling the programs in which you are most interested, including home and away-rotation programs, unless current specialty or program guidance says otherwise.",
      "bullets": [
        "Do not assume an away rotation automatically substitutes for a signal.",
        "Check current specialty and program instructions before deciding not to signal a home or away institution.",
        "A successful rotation can strengthen the reason for a signal because you have first-hand knowledge of the training environment.",
        "A poor rotation experience is useful information too; it may tell you that the program should leave your list.",
        "Geographic ties are strongest when specific and genuine: family, partner, prior residence, education, community involvement or a credible long-term plan."
      ]
    },
    {
      "number": 13,
      "title": "Avoid common signaling mistakes",
      "bullets": [
        "Prestige-only signaling: choosing famous institutions without checking eligibility, competitiveness or actual fit.",
        "Fear-only signaling: avoiding every dream program even when a carefully selected Reach signal has a credible story.",
        "Ignoring hard filters: signaling where visa, graduation-year, exam or track rules make review unlikely.",
        "Leaving signals unused: current applicant guidance generally recommends using the available allocation; unused signals offer no later advantage.",
        "Copying another applicant's list: the right strategy changes with profile, specialty, geography and sponsorship needs.",
        "Assuming no signal means automatic rejection—or that a gold signal guarantees an interview. Program behavior and complete applications still matter.",
        "Signaling before researching training, then discovering that the program lacks the pathway, setting, location or policies you need.",
        "Treating signals as final ranks. Your NRMP list should reflect true preferences after interviews, not the signal tier assigned months earlier."
      ]
    },
    {
      "number": 14,
      "title": "Follow a ten-step allocation workflow",
      "bullets": [
        "1. Confirm your specialty's current signal count and whether it uses one tier or gold and silver tiers.",
        "2. Build a broad program list before thinking about where to signal.",
        "3. Remove programs where you clearly fail mandatory eligibility requirements.",
        "4. If you are an IMG, verify visa sponsorship and IMG-specific requirements.",
        "5. Research curriculum, residents, mission, location, fellowships, research, training sites and application criteria.",
        "6. Label each remaining program Reach, Target or Safer-fit based on your actual profile.",
        "7. Score personal fit and career fit separately from competitiveness.",
        "8. Draft a deliberately diversified signal portfolio.",
        "9. Complete the sentence 'I am signaling this program because…' for every choice; weak, generic answers reveal weak choices.",
        "10. Recheck current AAMC and program guidance immediately before submission, then assign the available signals deliberately."
      ]
    },
    {
      "number": 15,
      "title": "Complete a worksheet for every proposed signal",
      "introduction": "Use one record per program so every signal is supported by the same evidence rather than memory or last-minute instinct.",
      "bullets": [
        "Record the program name, specialty or track and available signal tier.",
        "Write why you genuinely want the program and which part of its training model supports your goals.",
        "Identify your strongest evidence of fit and classify the program as Reach, Target or Safer-fit.",
        "Record your visa requirement and the current source that confirms sponsorship.",
        "Confirm graduation-year, exam, ECFMG, clinical-experience and IMG requirements.",
        "Record real geographic, personal, rotation, research or mentor connections.",
        "Answer honestly: would you be happy to rank this program if the interview confirms the fit?",
        "Make the final choice explicit: SIGNAL or DO NOT SIGNAL."
      ]
    },
    {
      "number": 16,
      "title": "Reassess everything after the interview",
      "introduction": "A signal helped express interest before interview selection; it should not dictate your final rank order.",
      "bullets": [
        "Use the interview to reassess resident culture, workload, supervision, education, location and career opportunities.",
        "Programs may use signals mainly for interview selection and may stop using the tier later in recruitment.",
        "You do not need to repeatedly remind interviewers that you signaled; if it arises naturally, explain the specific reasons behind your interest.",
        "Build the NRMP rank-order list in your true preference order. Do not rank based on where you think you are most likely to match."
      ],
      "links": [
        {
          "label": "NRMP guidance on ranking programs",
          "url": "https://www.nrmp.org/residency-applicants/rank-your-programs-main/"
        }
      ]
    },
    {
      "number": 17,
      "title": "Keep the final strategy principles visible",
      "bullets": [
        "Signal fit, not just fame, and verify eligibility before spending scarcity.",
        "Use data to classify programs without pretending residency selection is perfectly predictable.",
        "Keep thoughtful ambition in the portfolio; a Reach signal can be worthwhile when the interest and application story are genuine.",
        "Diversify so every signal does not depend on the same optimistic assumption.",
        "In tiered systems, gold should represent high conviction.",
        "For IMGs, visa sponsorship and program eligibility are core strategy variables, not afterthoughts.",
        "Research curriculum, values, patient population, training style and outcomes to decide whether you truly want to train there.",
        "Recheck every cycle because signal counts and program participation can change."
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$A disciplined signal list is not a list of the most famous programs you can name. It is a researched portfolio of programs you genuinely want, can access and can explain. Confirm the hard filters first, then balance preference, profile fit, connections and competitiveness.$conclusion$,
    $conclusion$The simplest principle is also the most important: a good signal does not replace a strong application—it amplifies one. Use every signal to tell a coherent truth about where you want to train and why your record belongs in that program's review pile.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "AAMC — Program Signaling for the 2027 MyERAS Application Season",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/program-signaling-2027-myeras-application-season"
    },
    {
      "label": "AAMC — Program Signals Overview for ERAS Applicants",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/program-signals-overview-eras-applicants"
    },
    {
      "label": "AAMC — Program Signals: A Guide for the 2027 ERAS Season",
      "url": "https://www.aamc.org/media/82411/download"
    },
    {
      "label": "AAMC — ERAS statistics",
      "url": "https://www.aamc.org/data-reports/publication/eras-statistics"
    },
    {
      "label": "AAMC — Program signaling data and residency selection",
      "url": "https://www.aamc.org/services/eras-institutions/program-signaling-data"
    },
    {
      "label": "NRMP — Ranking programs in the Main Residency Match",
      "url": "https://www.nrmp.org/residency-applicants/rank-your-programs-main/"
    }
  ]
  $sources$::jsonb,
  'residency_program_signalling_strategy_2027.pdf',
  '2026-08-22',
  true,
  '2026-08-22 21:28:11+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
begin
  select count(*), jsonb_array_length(max(sections::text)::jsonb)
  into seeded_count, section_count
  from public.guidelines
  where slug = 'residency-program-signaling-strategy-2027';

  if seeded_count <> 1 or section_count <> 17 then
    raise exception 'Expected one published 17-section signaling guideline, found % article(s) and % section(s)', seeded_count, section_count;
  end if;
end;
$$;

commit;
