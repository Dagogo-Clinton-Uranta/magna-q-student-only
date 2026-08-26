begin;

with article as (
  select
    'How to Carry Out Research Projects That Strengthen a Residency Application'::text as title,
    'From a feasible question to an honest scholarly output'::text as eyebrow,
    'Follow a practical, ethical workflow to choose a research question, find mentorship, plan and complete the work, publish responsibly, and explain your contribution during the 2027 ERAS season.'::text as summary,
    array[
      'Choose a focused question that fits your time, access, skills and mentor support.',
      'Match the study design to the question instead of chasing the most impressive label.',
      'Search the literature reproducibly and turn a genuine gap into a project plan.',
      'Clarify ethics, data access, roles and authorship before the work begins.',
      'Collect, analyze, write and submit with methods another researcher could follow.',
      'Represent every output and your exact contribution accurately in ERAS and interviews.'
    ]::text[] as summary_points,
    array[
      $preamble$Research strengthens a residency application when it demonstrates curiosity, follow-through, teamwork and honest ownership—not when it merely increases a publication count. A useful project begins with a focused question, uses a suitable method, protects participants and data, and reaches an output you can explain clearly.$preamble$,
      $preamble$This article turns the supplied 2027 research guide into a step-by-step workflow for medical students, IMGs and residency applicants. It is educational guidance, not a substitute for a research mentor, statistician, institutional research office, IRB or ethics committee, journal instructions or current official ERAS policy.$preamble$
    ]::text[] as preamble,
    $sections$
    [
      {
        "number": 1,
        "title": "Define what a successful project means",
        "introduction": "Begin with the skill, question and realistic output you want—not a target number of publications.",
        "bullets": [
          "Research can demonstrate intellectual curiosity, follow-through, specialty commitment, mentorship, teamwork, data literacy, critical appraisal and scientific communication.",
          "A finished abstract, poster, letter, case report or manuscript is usually more useful than several ambitious projects that never reach an interpretable result.",
          "Choose a project you will understand deeply enough to explain the question, design, result, limitation and your exact contribution without notes.",
          "Research is only one part of residency selection. Exam performance, clinical experience, letters, professionalism, specialty fit, application strategy and interviews may also matter.",
          "For the 2027 MyERAS application, AAMC calls this area Scholarly Work, permits applicants to group related work into Scholarly Collections and identify up to three entries as Most Meaningful.",
          "Never fabricate a role, author position, dataset, submission, acceptance, presentation or publication status."
        ],
        "links": [
          {
            "label": "AAMC — what to know about the 2027 ERAS season",
            "url": "https://students-residents.aamc.org/applying-residencies-eras/what-you-need-know-about-2027-eras-application-season"
          },
          {
            "label": "AAMC — 2027 MyERAS Applicant User Guide",
            "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
          }
        ]
      },
      {
        "number": 2,
        "title": "Choose a study type that fits the question",
        "introduction": "The best design is the one that can answer the question credibly with the access, supervision, time and skills you actually have.",
        "bullets": [
          "A letter to the editor is a concise, evidence-based response to a recent article and can be a useful first scientific-writing exercise when the journal accepts correspondence.",
          "A case report or case series can suit a genuinely educational clinical case, but it requires supervision and compliance with consent, privacy and journal policy.",
          "Cross-sectional and retrospective studies analyze existing observations or records; they commonly require authorized data access, ethics review and statistical support.",
          "Prospective observational studies follow participants forward, while clinical trials assign an intervention. Time-limited applicants should usually join an established team rather than launch a trial independently.",
          "A narrative review provides a scholarly overview. A systematic review requires a predefined, reproducible search, explicit eligibility rules, screening, extraction and risk-of-bias assessment.",
          "A meta-analysis adds statistical pooling only when the included studies are sufficiently comparable; it is not simply a review with numbers."
        ],
        "links": [
          {
            "label": "ClinicalTrials.gov — learn about study types",
            "url": "https://clinicaltrials.gov/"
          }
        ]
      },
      {
        "number": 3,
        "title": "Turn a broad interest into a finishable question",
        "introduction": "A feasible project sits where clinical relevance, a genuine evidence gap, accessible data, mentor expertise and your deadline overlap.",
        "bullets": [
          "Replace a field such as ‘cardiology research’ with a specific population, intervention or exposure, comparator when relevant, and outcome. PICO can help structure a clinical question.",
          "Search before declaring an idea novel. Read recent reviews, guidelines and primary studies, especially their limitations and future-research sections.",
          "Look for contradictory findings, under-studied populations, new therapies, changing guidance, methodological weaknesses or unanswered clinical decisions.",
          "Confirm that you can legally obtain the literature or data and that someone can supervise the methods and statistics.",
          "Work backward from the application or presentation window and define the smallest meaningful output that can be completed well.",
          "Worked story — ‘Artificial intelligence in radiology’ is too broad. ‘External validation of AI-assisted pulmonary embolism detection in emergency CT pulmonary angiography’ is closer to a researchable question, but only with suitable data, ethics approval, supervision and statistical support."
        ]
      },
      {
        "number": 4,
        "title": "Search the literature systematically",
        "introduction": "A documented search shows what is already known, sharpens the gap and creates the foundation for reproducible methods and writing.",
        "bullets": [
          "Start with a recent high-quality review or guideline, then search primary studies from roughly the last two to five years using the disease, intervention or exposure, and outcome.",
          "Use PubMed for biomedical citations and MEDLINE/MeSH searching; use PubMed Central when you need freely available full text.",
          "Use Europe PMC for publications, preprints, grants, protocols and linked data, and OpenAlex to explore authors, institutions, funders, topics and citation networks.",
          "Use ClinicalTrials.gov to identify registered studies, investigators, locations, recruitment status, outcomes and design details.",
          "Use citation chasing in both directions: inspect the reference lists of strong papers and the newer work that cites them.",
          "Save the exact databases, search strings, filters and search dates. For evidence synthesis, reproducibility begins before screening."
        ],
        "links": [
          {
            "label": "PubMed — biomedical literature search",
            "url": "https://pubmed.ncbi.nlm.nih.gov/"
          },
          {
            "label": "PubMed Central — free full-text archive",
            "url": "https://pmc.ncbi.nlm.nih.gov/"
          },
          {
            "label": "Europe PMC — life-science research discovery",
            "url": "https://europepmc.org/"
          },
          {
            "label": "OpenAlex — open scholarly catalog",
            "url": "https://openalex.org/"
          }
        ]
      },
      {
        "number": 5,
        "title": "Find a mentor and an active team",
        "introduction": "Targeted outreach works better than sending the same generic request to hundreds of researchers.",
        "bullets": [
          "Choose one specialty and a narrow area, then search the last 24 months for authors who publish repeatedly in it.",
          "Confirm each investigator's current institution, role, research focus and active projects on institutional pages, study registries and recent conference programs.",
          "Read two or three recent papers before writing. Mention a specific method, question or possible follow-up so the recipient knows why you selected them.",
          "Offer a concrete contribution you can perform reliably: literature screening, reference management, authorized chart abstraction, data cleaning, tables, figures or statistical work you genuinely know how to do.",
          "Keep the message short: who you are, the specific work that interests you, evidence that you read it, your useful skills and a request for a brief conversation.",
          "Track outreach in a spreadsheet. One polite follow-up after about 7–14 days is reasonable; then move on if there is no response.",
          "Do not ask to have your name added to a paper. Ask where you can reduce the team's workload while maintaining quality."
        ]
      },
      {
        "number": 6,
        "title": "Secure ethics, access and authorship expectations first",
        "introduction": "Do not collect, receive or analyze data until the responsible institution has determined the applicable oversight and access requirements.",
        "bullets": [
          "Ask whether the project requires IRB or ethics review, exemption, consent, a data-use agreement, privacy review or research-compliance training.",
          "Hospital records, registries, trials and private datasets are controlled because they may contain protected, regulated, proprietary or unpublished information.",
          "Use only approved accounts, systems and storage. Never place identifiable patient information in personal email, unauthorized cloud drives or unapproved AI tools.",
          "Clarify who supervises the question, methods, statistics, data access and manuscript before beginning.",
          "Discuss authorship early using recognized contribution standards. Payment, status or a promised favor does not replace meaningful intellectual and practical contribution.",
          "Public study information does not imply public participant-level data. Resources such as dbGaP and the All of Us Researcher Workbench may require institutional approval, identity verification, training and formal access."
        ],
        "links": [
          {
            "label": "dbGaP — genotype and phenotype data access",
            "url": "https://dbgap.ncbi.nlm.nih.gov/"
          },
          {
            "label": "NIH All of Us Research Program",
            "url": "https://allofus.nih.gov/"
          }
        ]
      },
      {
        "number": 7,
        "title": "Write the protocol and project plan",
        "introduction": "A written plan turns an interesting idea into work that a team can execute, review and reproduce.",
        "bullets": [
          "State the research question and primary objective in one or two sentences.",
          "Define the population, variables or intervention, comparator where relevant, outcomes, inclusion and exclusion criteria, sources and time period.",
          "Predefine the analysis with appropriate supervision; do not wait to see which test produces a significant result.",
          "For a review, define databases, full search strategy, eligibility criteria, screening process, extraction fields and risk-of-bias approach before screening begins.",
          "Assign named owners and dates for access, searching, screening or collection, cleaning, analysis, figures, writing, internal review and submission.",
          "Agree on the target output and a backup output. A poster or abstract can preserve useful work if a full manuscript cannot meet the application timeline.",
          "Register or preregister when appropriate and preserve versioned project materials in an approved workspace."
        ],
        "links": [
          {
            "label": "Open Science Framework — protocols and project materials",
            "url": "https://osf.io/"
          }
        ]
      },
      {
        "number": 8,
        "title": "Collect and manage data reproducibly",
        "introduction": "Clean, traceable data practices protect participants, reduce errors and make the eventual methods defensible.",
        "bullets": [
          "Build the data-collection or extraction form from the protocol rather than inventing fields as you go.",
          "Create a data dictionary defining every variable, permitted value, unit, missing-value code and derived field.",
          "Pilot the form on a small sample and correct ambiguous definitions before full collection begins.",
          "Document who collected or changed what, when and why. Preserve raw data as read-only when institutional policy permits and perform cleaning on controlled copies.",
          "Use duplicate screening or extraction and adjudication when required by the review method; measure agreement when appropriate.",
          "Run range, consistency, duplicate and missingness checks before analysis, and record every exclusion.",
          "Report unexpected protocol deviations to the mentor and oversight body when required instead of quietly repairing the record."
        ]
      },
      {
        "number": 9,
        "title": "Analyze the question you planned to answer",
        "introduction": "Analysis should follow the design, data type and prespecified plan—not a search for the most attractive p-value.",
        "bullets": [
          "Confirm that the dataset matches the eligibility criteria and resolve documented quality issues before modeling.",
          "Describe the sample and missing data clearly before presenting associations or treatment effects.",
          "Use statistical methods appropriate to the outcome, sampling, repeated measurements, confounding and assumptions, with qualified support when needed.",
          "Distinguish prespecified from exploratory analyses and label post hoc findings honestly.",
          "Report effect sizes and uncertainty where appropriate; statistical significance alone does not establish clinical importance or causality.",
          "Keep analysis code, decision logs and output versions in the approved project environment so results can be reproduced.",
          "Interpret findings within the design's limits. An observational association does not automatically prove that an exposure caused an outcome."
        ]
      },
      {
        "number": 10,
        "title": "Write while the project is running",
        "introduction": "Early writing exposes missing decisions and prevents the entire manuscript from becoming a last-minute task.",
        "bullets": [
          "Draft the introduction and methods after the protocol is stable, then update the methods to reflect what was actually done.",
          "Use the introduction to establish the clinical problem, current knowledge, specific gap and objective without turning it into a broad textbook review.",
          "Present results in the order of the objectives. Make tables and figures understandable without forcing the reader to search the text for definitions.",
          "In the discussion, state the principal finding, compare it with prior evidence, explain plausible meaning, acknowledge limitations and avoid conclusions the design cannot support.",
          "Maintain references from the beginning and verify every citation, number, label and statistical claim against the source or output.",
          "Use the reporting guideline appropriate to the design and obtain every author's approval before submission.",
          "Keep patient details de-identified and include consent or ethics statements required by the institution and journal."
        ]
      },
      {
        "number": 11,
        "title": "Select a legitimate venue and navigate peer review",
        "introduction": "Journal or conference fit, transparent editorial practice and credible review matter more than a promise of unusually fast publication.",
        "bullets": [
          "Check whether the venue publishes your topic and format, and read its author instructions before adapting the manuscript or abstract.",
          "Verify indexing claims independently. Review the publisher, editorial board, peer-review process, fees, retraction policy and publication-ethics statements.",
          "Treat guaranteed acceptance, purchased authorship, fake metrics, unclear fees and aggressive unsolicited invitations as warning signs.",
          "Submit to one journal at a time unless the venue explicitly permits another arrangement.",
          "Respond to reviewers point by point, identify each revision and explain respectful disagreements with evidence.",
          "Preserve the submitted version, decision letters, revisions, final citation, DOI or PMID, conference details and acceptance evidence.",
          "A rejection is not evidence that the project was worthless. Use credible feedback to improve the work and select a better-fitting venue."
        ],
        "links": [
          {
            "label": "Cochrane Library — evidence synthesis",
            "url": "https://www.cochranelibrary.com/"
          }
        ]
      },
      {
        "number": 12,
        "title": "Use a 90-day beginner plan",
        "introduction": "A short plan cannot guarantee publication, but it can move a beginner from broad interest to a legitimate contribution and concrete output.",
        "bullets": [
          "Weeks 1–2: choose one specialty and topic, learn PubMed, read 10–15 recent papers and produce a one-page topic map plus reference library.",
          "Weeks 2–3: identify 15–25 realistic mentors or teams and active studies; rank them and send tailored outreach.",
          "Weeks 3–5: join a feasible project or define a supervised review or commentary; document the question, role, timeline, ethics and access plan.",
          "Weeks 5–8: perform assigned work reliably, document methods and produce a screening set, extraction sheet, cleaned dataset, analysis draft or early manuscript sections.",
          "Weeks 8–10: turn the work into an abstract, poster, letter or manuscript draft that matches a legitimate venue.",
          "Weeks 10–12: revise, submit or present where appropriate, organize evidence and prepare a six-question interview summary.",
          "If starting late, describe legitimate ongoing or submitted work accurately. Do not use predatory publishing, purchased authorship, ghostwriting or fabricated data to manufacture a quick result."
        ]
      },
      {
        "number": 13,
        "title": "Show research ownership in ERAS and interviews",
        "introduction": "The application should tell one accurate scholarly story, while the interview should prove that you understand the work behind every entry.",
        "bullets": [
          "Think in projects rather than isolated citations. A presentation, poster, manuscript and publication may come from one coherent line of inquiry.",
          "Choose Most Meaningful work for the strength of your contribution, learning and specialty relevance—not automatically the most prestigious journal name.",
          "Use precise status labels. In preparation, submitted, accepted, presented and published are different claims.",
          "For every project, know the problem, why it mattered, the design, exactly what you did, the main finding, the largest limitation and what should happen next.",
          "Illustrative story — Paul joins many projects, understands few of them and pays a questionable journal for quick publication. In an interview, he cannot explain why an analysis was performed.",
          "Illustrative story — Sally joins one specialty-focused group, masters the methods, screens literature, builds a clean extraction sheet, presents a poster and contributes to a manuscript. She can explain the clinical importance and limitations clearly.",
          "Sally's strength is not a smaller publication count by itself. It is visible ownership, continuity, useful skills, reliable contribution and a scholarly story that withstands questions."
        ]
      }
    ]
    $sections$::jsonb as sections,
    array[
      $conclusion$A strong research project is not the one with the most complicated method or the fastest publication. It is the one that asks a worthwhile, answerable question; follows ethical and reproducible methods; and reaches an honest output the applicant genuinely understands.$conclusion$,
      $conclusion$Move in order: narrow the question, confirm feasibility, find appropriate supervision, secure ethics and access, write the protocol, collect clean data, analyze the planned question, write transparently and submit to a legitimate venue. At every stage, document both the work and your contribution.$conclusion$,
      $conclusion$Before ERAS and interviews, audit every status and citation and rehearse the six-question explanation of every project. Research becomes a credible residency strength when your application and your own words tell the same accurate story.$conclusion$
    ]::text[] as conclusion,
    $sources$
    [
      {
        "label": "AAMC — what to know about the 2027 ERAS season",
        "url": "https://students-residents.aamc.org/applying-residencies-eras/what-you-need-know-about-2027-eras-application-season"
      },
      {
        "label": "AAMC — 2027 MyERAS Applicant User Guide",
        "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
      },
      {
        "label": "PubMed — biomedical literature search",
        "url": "https://pubmed.ncbi.nlm.nih.gov/"
      },
      {
        "label": "PubMed Central — free full-text biomedical archive",
        "url": "https://pmc.ncbi.nlm.nih.gov/"
      },
      {
        "label": "Europe PMC — literature, preprints, grants and protocols",
        "url": "https://europepmc.org/"
      },
      {
        "label": "ClinicalTrials.gov — registered clinical studies",
        "url": "https://clinicaltrials.gov/"
      },
      {
        "label": "OpenAlex — scholarly works, authors and institutions",
        "url": "https://openalex.org/"
      },
      {
        "label": "dbGaP — public and controlled-access research data",
        "url": "https://dbgap.ncbi.nlm.nih.gov/"
      },
      {
        "label": "NIH All of Us Research Program",
        "url": "https://allofus.nih.gov/"
      },
      {
        "label": "Open Science Framework",
        "url": "https://osf.io/"
      },
      {
        "label": "Cochrane Library",
        "url": "https://www.cochranelibrary.com/"
      },
      {
        "label": "medRxiv",
        "url": "https://www.medrxiv.org/"
      },
      {
        "label": "bioRxiv",
        "url": "https://www.biorxiv.org/"
      },
      {
        "label": "ORCID",
        "url": "https://orcid.org/"
      }
    ]
    $sources$::jsonb as source_links
), destinations(slug, classification, published_at) as (
  values
    ('research-projects-for-residency-step-2-2027', 'usmle-step-2-ck', '2026-08-26 13:00:00+01'::timestamptz),
    ('research-projects-for-residency-step-3-2027', 'usmle-step-3', '2026-08-26 13:00:00+01'::timestamptz),
    ('research-projects-for-residency-2027', 'residency-and-matching', '2026-08-26 13:00:00+01'::timestamptz)
)
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
)
select
  destinations.slug,
  article.title,
  article.eyebrow,
  article.summary,
  article.summary_points,
  destinations.classification,
  article.preamble,
  article.sections,
  article.conclusion,
  null,
  article.source_links,
  'medical_research_for_residency_2027_guide.pdf',
  '2026-08-26',
  true,
  destinations.published_at
from article
cross join destinations;

do $$
declare
  seeded_count integer;
  classification_count integer;
  section_count integer;
begin
  select
    count(*),
    count(distinct classification),
    min(jsonb_array_length(sections))
  into seeded_count, classification_count, section_count
  from public.guidelines
  where slug in (
    'research-projects-for-residency-step-2-2027',
    'research-projects-for-residency-step-3-2027',
    'research-projects-for-residency-2027'
  );

  if seeded_count <> 3 or classification_count <> 3 or section_count <> 13 then
    raise exception 'Expected three published 13-section research guidelines in three classifications; found % article(s), % classification(s), and % section(s)', seeded_count, classification_count, section_count;
  end if;
end;
$$;

commit;
