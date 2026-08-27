begin;

create table public.resources (
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
      'residency-and-matching'
    )
  ),
  preamble text[] not null check (cardinality(preamble) between 1 and 8),
  sections jsonb not null check (public.valid_guideline_sections(sections)),
  conclusion text[] not null check (cardinality(conclusion) between 1 and 8),
  s3_media jsonb check (public.valid_guideline_media(s3_media)),
  source_links jsonb not null default '[]'::jsonb
    check (jsonb_typeof(source_links) = 'array'),
  source_document_name text,
  author_name text not null default 'Magna-Q Editorial Team',
  reviewed_at date not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (not published or published_at is not null)
);

comment on table public.resources is
  'Stage-classified, database-backed resource articles presented in the same structured format as guideline articles.';
comment on column public.resources.s3_media is
  'Optional public HTTPS S3 image/video assets linked to an article section by sectionNumber.';
comment on column public.resources.classification is
  'Assigns the resource to USMLE Step 1, Step 2 CK, Step 3, or residency matching.';

create index resources_classification_published_date_idx
  on public.resources (classification, published, published_at desc);

create trigger resources_updated before update on public.resources
for each row execute function public.set_updated_at();

alter table public.resources enable row level security;

create policy resources_published_read on public.resources
for select to authenticated using (published);

create policy resources_admin_all on public.resources
for all to authenticated
using (public.current_user_role() = 'admin')
with check (public.current_user_role() = 'admin');

grant select, insert, update, delete on public.resources to authenticated;

with placeholder_resources (
  classification,
  slug,
  title,
  eyebrow,
  summary,
  summary_points,
  published_at
) as (
  values
    (
      'usmle-step-1',
      'building-a-sustainable-step-1-study-week',
      'Building a Sustainable Step 1 Study Week',
      'Temporary Step 1 planning resource',
      'A sample framework for balancing content review, question practice, spaced repetition, rest, and weekly reflection during Step 1 preparation.',
      array[
        'Turn broad study goals into a repeatable weekly rhythm.',
        'Balance new learning with retrieval practice and recovery.',
        'Use a short weekly review to adjust the next plan.'
      ],
      '2026-08-27 12:08:00+00'::timestamptz
    ),
    (
      'usmle-step-1',
      'a-practical-framework-for-learning-pharmacology',
      'A Practical Framework for Learning Pharmacology',
      'Temporary Step 1 learning resource',
      'A sample article showing how students can connect drug mechanisms, adverse effects, clinical uses, and question clues without relying on isolated memorization.',
      array[
        'Organize medications by mechanism and clinical purpose.',
        'Link adverse effects to physiology and likely vignettes.',
        'Build compact comparisons for commonly confused drug classes.'
      ],
      '2026-08-27 12:07:00+00'::timestamptz
    ),
    (
      'usmle-step-2-ck',
      'clinical-reasoning-from-presentation-to-next-step',
      'Clinical Reasoning: From Presentation to Next Step',
      'Temporary Step 2 CK reasoning resource',
      'A sample approach to identifying the clinical problem, checking immediate threats, comparing likely diagnoses, and selecting the most appropriate next action.',
      array[
        'Separate stabilization questions from diagnostic questions.',
        'Use the patient context to rank plausible diagnoses.',
        'Match the next step to urgency, certainty, and test risk.'
      ],
      '2026-08-27 12:06:00+00'::timestamptz
    ),
    (
      'usmle-step-2-ck',
      'turning-nbme-review-into-a-learning-system',
      'Turning NBME Review Into a Learning System',
      'Temporary Step 2 CK review resource',
      'A sample system for reviewing practice assessments by knowledge gap, interpretation error, prioritization mistake, and timing pattern.',
      array[
        'Classify why each missed question was missed.',
        'Convert explanations into focused follow-up practice.',
        'Track recurring reasoning patterns across assessments.'
      ],
      '2026-08-27 12:05:00+00'::timestamptz
    ),
    (
      'usmle-step-3',
      'building-a-two-day-step-3-plan',
      'Building a Two-Day Step 3 Preparation Plan',
      'Temporary Step 3 planning resource',
      'A sample preparation map that distinguishes Day 1 foundations from Day 2 clinical management and incorporates regular CCS practice.',
      array[
        'Plan separately for the emphasis of each examination day.',
        'Mix question blocks with short, deliberate CCS sessions.',
        'Use practice results to rebalance the final study weeks.'
      ],
      '2026-08-27 12:04:00+00'::timestamptz
    ),
    (
      'usmle-step-3',
      'a-repeatable-ccs-case-workflow',
      'A Repeatable CCS Case Workflow',
      'Temporary Step 3 CCS resource',
      'A sample framework for initial stabilization, focused orders, location decisions, interval reassessment, counseling, and case closure in CCS practice.',
      array[
        'Begin with acuity, safety, and the appropriate care setting.',
        'Order purposefully and reassess after meaningful intervals.',
        'Close cases with prevention, counseling, and follow-up.'
      ],
      '2026-08-27 12:03:00+00'::timestamptz
    ),
    (
      'residency-and-matching',
      'building-a-balanced-residency-program-list',
      'Building a Balanced Residency Program List',
      'Temporary residency matching resource',
      'A sample workflow for moving from a broad program list to a researched portfolio based on eligibility, training fit, location, visa needs, and application strategy.',
      array[
        'Verify eligibility before spending time on deeper research.',
        'Compare programs using a consistent set of personal criteria.',
        'Document uncertainties that require direct confirmation.'
      ],
      '2026-08-27 12:02:00+00'::timestamptz
    ),
    (
      'residency-and-matching',
      'preparing-stories-for-residency-interviews',
      'Preparing Stories for Residency Interviews',
      'Temporary residency interview resource',
      'A sample article for selecting concise, authentic examples that demonstrate teamwork, growth, judgment, communication, and readiness for residency.',
      array[
        'Choose stories with a clear situation and personal contribution.',
        'Explain decisions and growth without overstating your role.',
        'Practice flexible story outlines instead of memorized scripts.'
      ],
      '2026-08-27 12:01:00+00'::timestamptz
    )
)
insert into public.resources (
  classification,
  slug,
  title,
  eyebrow,
  summary,
  summary_points,
  preamble,
  sections,
  conclusion,
  s3_media,
  source_links,
  source_document_name,
  reviewed_at,
  published,
  published_at
)
select
  classification,
  slug,
  title,
  eyebrow,
  summary,
  summary_points,
  array[
    'This is temporary sample content created to demonstrate the resource article interface. Replace it with reviewed editorial content before relying on it for study or application decisions.',
    summary
  ],
  jsonb_build_array(
    jsonb_build_object(
      'number', 1,
      'title', 'Start with a clear objective',
      'introduction', 'Define what a useful session or decision should produce before choosing tools or tactics.',
      'bullets', jsonb_build_array(
        summary_points[1],
        'Write down the outcome you want, the time available, and the evidence you will use to judge progress.',
        'Keep the first version small enough to repeat and improve.'
      ),
      'links', '[]'::jsonb
    ),
    jsonb_build_object(
      'number', 2,
      'title', 'Use a repeatable workflow',
      'introduction', 'A consistent sequence makes it easier to identify what is working and what needs to change.',
      'bullets', jsonb_build_array(
        summary_points[2],
        'Work through one focused cycle, record important decisions, and avoid changing several variables at once.',
        'Prefer active recall, explanation, comparison, and deliberate practice over passive exposure.'
      ),
      'links', '[]'::jsonb
    ),
    jsonb_build_object(
      'number', 3,
      'title', 'Review and adjust',
      'introduction', 'Finish by converting the result into one practical change for the next cycle.',
      'bullets', jsonb_build_array(
        summary_points[3],
        'Separate a knowledge gap from a process, timing, or interpretation problem.',
        'Choose one specific adjustment and check whether it improves the next attempt.'
      ),
      'links', '[]'::jsonb
    )
  ),
  array[
    'Use this temporary resource to inspect the interface and navigation only. The placeholder content should be removed or replaced before release.'
  ],
  null,
  '[]'::jsonb,
  'Temporary visualization seed — safe to delete',
  '2026-08-27'::date,
  true,
  published_at
from placeholder_resources;

do $$
declare
  seeded_count integer;
  classification_count integer;
begin
  select count(*), count(distinct classification)
  into seeded_count, classification_count
  from public.resources
  where source_document_name = 'Temporary visualization seed — safe to delete';

  if seeded_count <> 8 or classification_count <> 4 then
    raise exception
      'Expected eight temporary resources across four classifications; found % resources across % classifications',
      seeded_count,
      classification_count;
  end if;
end;
$$;

commit;
