begin;

create or replace function public.valid_guideline_media(value jsonb)
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
      or (
        coalesce(asset->>'s3Url', '') !~ '^https://'
        and coalesce(asset->>'s3Url', '') !~ '^/guidelines/[a-zA-Z0-9/_-]+\.(avif|gif|jpe?g|png|svg|webp)$'
      )
      or char_length(btrim(coalesce(asset->>'altText', ''))) = 0
    then
      return false;
    end if;
  end loop;

  return true;
end;
$$;

comment on column public.guidelines.s3_media is
  'Optional public HTTPS or bundled /guidelines image/video assets linked to a section by sectionNumber.';

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
  'eras-tools-and-worksheets-residency-applicants-2027',
  'ERAS Tools and Worksheets for Residency Applicants: A Handheld 2027 Workflow',
  'Know which tool to open, what to record and what to check',
  'Use the official AAMC timeline, FAQs, Applicant Worksheet, Residency Explorer, fee calculator, checklist and MyERAS reports in one practical start-to-finish workflow.',
  array[
    'Use each official ERAS tool for the question it is designed to answer.',
    'Prefill the Applicant Worksheet privately before entering information in MyERAS.',
    'Research programs in Residency Explorer, then verify eligibility on official program pages.',
    'Build a program tracker for visa support, signals, documents, deadlines and fees.',
    'Calculate application costs by specialty before the list becomes expensive.',
    'Pause at separate application, assignment and invoice checks before applying.',
    'Monitor reports, messages and document delivery after payment.'
  ],
  'residency-and-matching',
  array[
    $preamble$The AAMC tools page is a toolbox, not a single set of instructions. The timeline tells you when actions open, the worksheet helps you prepare offline, Residency Explorer helps you research, the fee calculator models cost, the checklist prevents missed tasks and the MyERAS User Guide explains the live system.$preamble$,
    $preamble$This guide shows when to use each resource, what to take from it and how to move from preparation to the portal without losing track of details. It is a companion to the official AAMC resources, not a replacement for them.$preamble$,
    $preamble$The visuals below are original Magna-Q walkthroughs based on the published workflow. They are deliberately labeled as illustrations because the authenticated MyERAS portal is not publicly accessible and its screens can change. Use the button names and layout in your live portal when they differ from an illustration.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Understand the seven-tool toolkit",
      "introduction": "Give every resource one job so you know where to look when a question appears.",
      "bullets": [
        "ERAS Tools and Worksheets hub—Your official index for the current Applicant User Guide, FAQs, timeline, fees, Residency Explorer, Applicant Worksheet and Applicant Checklist.",
        "2027 Residency Timeline—The controlling schedule for when the season opens, when applicants may apply and when programs may begin reviewing.",
        "2027 MyERAS Applicant User Guide—The field-by-field manual for registration, application sections, documents, programs, assignments and post-application actions.",
        "ERAS Residency Applicant FAQs—The changing answer bank for common access, application, document and policy questions.",
        "2027 ERAS Applicant Worksheet—A 26-page offline preparation form that mirrors many application questions and character limits.",
        "Residency Explorer—A research and comparison tool for specialties, programs, applicant data and program alignment.",
        "Fee Calculator and Applicant Checklist—Your budget model and final task audit. Neither replaces the live MyERAS invoice or program-specific requirements."
      ],
      "links": [
        {
          "label": "AAMC — ERAS tools and worksheets hub",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/eras-tools-and-worksheets-residency-applicants"
        }
      ]
    },
    {
      "number": 2,
      "title": "Use the tools in the right sequence",
      "introduction": "The safest sequence moves from dates and offline preparation to research, budgeting, portal entry, final checking and monitoring.",
      "bullets": [
        "Start with the Timeline and FAQs so you know the season dates, access rules, current changes and support route.",
        "Download a fresh Applicant Worksheet and draft privately before opening long MyERAS forms.",
        "Use Residency Explorer and participating-program information to create a researched longlist rather than searching randomly inside MyERAS.",
        "Run the Fee Calculator while the list is still flexible; application charges increase after the first 30 programs in each specialty.",
        "Transfer verified information into MyERAS one section at a time, saving and previewing as you work.",
        "Use the Applicant Checklist and MyERAS assignment reports before applying, then keep monitoring messages and document status after payment."
      ]
    },
    {
      "number": 3,
      "title": "Turn the 2027 Timeline into personal deadlines",
      "introduction": "The official dates tell you when the system changes state; your personal deadlines should be earlier and should include every dependency.",
      "bullets": [
        "The 2027 ERAS season opened June 4, 2026 at 9:00 a.m. Eastern Time.",
        "Residency applicants may begin submitting MyERAS applications to programs September 2, 2026 at 9:00 a.m. Eastern Time.",
        "Residency programs may begin reviewing MyERAS applications and MSPEs September 23, 2026 at 9:00 a.m. Eastern Time. Applications sent during the earlier submission window are not an excuse to postpone document verification.",
        "The 2027 ERAS season ends May 31, 2027 at 5:00 p.m. Eastern Time.",
        "Add local-time equivalents to your own calendar and label them ET as well. A timezone mistake on an irreversible action is preventable.",
        "Create earlier internal dates for requesting letters, completing the worksheet, advisor review, transcript authorization, program verification, signals, final preview and payment.",
        "Recheck the official timeline and program deadlines. ERAS season dates do not mean every residency program accepts applications for the entire season."
      ],
      "links": [
        {
          "label": "AAMC — 2027 ERAS Residency Timeline",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
        }
      ]
    },
    {
      "number": 4,
      "title": "Use the User Guide as the portal manual",
      "introduction": "Open the User Guide beside MyERAS when you need to understand a screen, status, assignment or irreversible action.",
      "bullets": [
        "Use its table of contents to jump to the task you are performing: registration, application, documents, programs, post-application communication or history.",
        "Read the relevant chapter before clicking Confirm, Certify, Submit, Assign or Apply. These words do not mean the same thing.",
        "When a status is unclear—such as a letter that is confirmed but not uploaded, or a transcript that is processing—use the matching User Guide chapter before repeating the action.",
        "Keep the guide open when assigning personal statements, letters and transcripts because availability in MyERAS does not always mean a document is assigned to every program.",
        "Use the live guide for current button labels and workflow details; this article’s illustrations explain the logic, not the exact authenticated screen."
      ],
      "links": [
        {
          "label": "AAMC — 2027 MyERAS Applicant User Guide",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
        }
      ]
    },
    {
      "number": 5,
      "title": "Use the FAQs for live-season questions",
      "introduction": "The AAMC states that the FAQs are updated throughout the 2027 season, making them the first stop for questions that may change.",
      "bullets": [
        "Search the topic groups for Getting Started, MyERAS Application, MyERAS Documents and ERAS Policies before relying on an old forum post.",
        "Use the FAQs to identify the correct Designated Dean’s Office: the medical school of graduation for most U.S. MD and DO applicants and ECFMG for IMGs.",
        "Remember that the ERAS token is current-season, single-use and issued by the Designated Dean’s Office. ERAS registration remains separate from NRMP or another Match registration.",
        "The AAMC advises against keeping multiple ERAS tabs open. Work in one portal tab so two versions of the same section do not conflict.",
        "If the portal behaves unexpectedly after maintenance, the FAQ suggests clearing the browser cache or opening a new browser. Mac users are advised to use Firefox or Chrome.",
        "When an answer affects money or eligibility, verify it against the current FAQ, the program and the office responsible for that document or rule."
      ],
      "links": [
        {
          "label": "AAMC — ERAS Residency Applicant FAQs",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/faqs-eras-residency-applicants"
        }
      ]
    },
    {
      "number": 6,
      "title": "Download the Applicant Worksheet and make a private working copy",
      "introduction": "The worksheet lets you gather information and draft responses without session pressure, but it contains highly sensitive personal information and must be stored privately.",
      "bullets": [
        "Download a fresh 2027 worksheet from the official tools page rather than reusing a prior-season copy.",
        "Save it in a private location with a clear version name, such as ERAS-2027-working-copy. Do not place completed worksheets in public drives, shared group folders or chat rooms.",
        "Treat red asterisks as required fields, while remembering that some fields become required only when a prior answer makes them applicable.",
        "Fill factual fields from source documents: passport or identity record, CV, transcripts, certificates, prior training records and publication citations.",
        "Draft narrative fields in a separate plain-text document with their character limits visible. Keep one source of truth rather than several conflicting drafts.",
        "The worksheet prepares information; it does not submit anything and does not automatically transfer into MyERAS."
      ],
      "links": [
        {
          "label": "AAMC — download the 2027 ERAS Applicant Worksheet PDF",
          "url": "https://students-residents.aamc.org/media/9711/download"
        }
      ]
    },
    {
      "number": 7,
      "title": "Transfer the worksheet into MyERAS one section at a time",
      "introduction": "A field-by-field transfer is slower than bulk copy-and-paste, but much safer for names, dates, identifiers and conditional questions.",
      "bullets": [
        "Open only one MyERAS tab and the relevant worksheet page or private draft.",
        "Verify the source, then copy one field or one complete response. Do not change a date or title from memory during transfer.",
        "Complete conditional fields created by Yes, No or None selections; required-field markers can change based on your response.",
        "Select Save before moving away from the section and confirm that the Dashboard no longer shows it as unsaved.",
        "Preview the application or CV as a program after each major group. Look for truncation, odd formatting, duplication and inconsistent chronology.",
        "Mark the worksheet section as Transferred and Previewed, but keep it until you have completed the final application audit."
      ]
    },
    {
      "number": 8,
      "title": "Break the worksheet into manageable packets",
      "introduction": "Do not attempt all 26 pages in one sitting. Group fields by the source documents and people needed to verify them.",
      "bullets": [
        "Identity and contact packet—AAMC account information, preferred contact details, current and permanent addresses and identifiers.",
        "Authorization and Match packet—Current work authorization, sponsorship needs, Match participation and relevant identification numbers. Answer according to current status, not a hoped-for future status.",
        "Background and preferences packet—Biographic information, language proficiency, geographic preferences and military or service obligations where applicable.",
        "Education packet—Higher education, medical education, postgraduate training, interruptions or extensions, honors, awards and memberships.",
        "Experiences packet—Up to 10 selected experiences, up to three most meaningful reflections, impactful experiences when applicable, and hobbies or interests.",
        "Credentials and scholarship packet—Licenses, certifications, additional questions and each scholarly work with accurate author order, status, dates and identifiers.",
        "Specialty and submission packet—Specialty questions where required, current signaling information and the certification statement. Recheck signaling outside the worksheet because the worksheet itself says that area will be updated as information becomes available."
      ],
      "links": [
        {
          "label": "AAMC — Applicant Worksheet PDF",
          "url": "https://students-residents.aamc.org/media/9711/download"
        }
      ]
    },
    {
      "number": 9,
      "title": "Use Residency Explorer to build a researched longlist",
      "introduction": "Residency Explorer supports specialty exploration, program comparison and application planning with source-verified national data.",
      "bullets": [
        "Begin with specialty profiles to understand training environment, competitiveness and field characteristics before comparing individual programs.",
        "Create your applicant profile carefully so alignment or interview-likelihood information is interpreted in the correct applicant context.",
        "Review program-level information such as applicant type, signaling, geographic alignment, interview-invitation patterns and available licensing-exam ranges.",
        "Use the side-by-side comparison tool for factors tied to your goals and needs, not only program reputation.",
        "Treat historical interview data as context, not a prediction or eligibility guarantee. A prior cycle cannot promise a current-cycle interview.",
        "Move promising programs into your own tracker for verification. Residency Explorer research is the start of program diligence, not the final word."
      ],
      "links": [
        {
          "label": "AAMC — Residency Explorer overview",
          "url": "https://students-residents.aamc.org/apply-smart-residency/residency-explorer-tool"
        },
        {
          "label": "Open Residency Explorer",
          "url": "https://www.residencyexplorer.org/"
        }
      ]
    },
    {
      "number": 10,
      "title": "Build a program tracker before using Saved Programs",
      "introduction": "Your tracker should connect research, eligibility, assignments, signals and cost so a program cannot reach the invoice with an unresolved question.",
      "bullets": [
        "Create one row per exact program and track, including specialty, program name, ACGME ID, city, state and official website.",
        "Add hard eligibility columns for graduation year, exam rules, attempts, clinical experience, ECFMG status and any program-specific requirements that apply.",
        "For applicants needing sponsorship, record the visa type only after the program confirms it. A generic institution policy may not apply to every residency track.",
        "Record the signal decision and tier, personal statement version, intended letters, exam transcript, photo and other required documents.",
        "Add the application deadline, verification date, source link, contact name if used and an unresolved-questions column.",
        "Add a fee-tier counter by specialty so the tracker explains the budget before MyERAS calculates the final invoice.",
        "Only mark Final Check complete when eligibility, track, visa, signal, documents and deadline have all been reviewed."
      ]
    },
    {
      "number": 11,
      "title": "Confirm participation and signaling before paying",
      "introduction": "A program appearing in a research tool is not enough; confirm that the exact specialty and program participate in ERAS and still accept applications.",
      "bullets": [
        "Use the official ERAS 2027 Participating Specialties & Programs page to open your specialty and review the current program list.",
        "Read any specialty-specific information linked from the participation page, then compare it with the specialty organization and program website.",
        "An asterisk on the participation page means the specialty does not participate with the NRMP; it does not mean the specialty is absent from ERAS.",
        "Contact a program before applying when participation, deadline, eligibility or visa information is unclear. ERAS does not refund an application sent to a nonparticipating program.",
        "Confirm current signaling participation and allowances in the live ERAS resources. Signals must be designated before applying and are sent with the application.",
        "Do not copy an old signal count from a spreadsheet or an earlier worksheet into the final plan without checking the current season."
      ],
      "links": [
        {
          "label": "AAMC — ERAS 2027 participating specialties and programs",
          "url": "https://systems.aamc.org/eras/erasstats/par/index.cfm"
        }
      ]
    },
    {
      "number": 12,
      "title": "Use the fee tools before the invoice",
      "introduction": "The fee page and spreadsheet calculator are planning tools; the live MyERAS invoice remains the amount you must verify before payment.",
      "bullets": [
        "For the 2027 season, applications 1–30 in each specialty cost $11 per program, while each application at 31 or more in that specialty costs $30.",
        "The count resets by specialty. For example, 25 programs in one specialty and 10 in another remain within the first tier for both specialties.",
        "The fee page lists an additional once-per-season charge of $70 for a USMLE transcript and $80 for a COMLEX-USA transcript.",
        "Tax may depend on the billing address. The accepted payment methods listed by AAMC are Visa, MasterCard, American Express and Discover.",
        "Use the downloadable spreadsheet to model a base list and one or two alternatives. Name the scenarios so you can see exactly which extra programs create the increase.",
        "Never let the fee threshold alone determine a program list, but do not discover the cost only after signals and documents are assigned.",
        "AAMC states that ERAS fees are nonrefundable. Confirm participation, eligibility and deadlines before payment."
      ],
      "links": [
        {
          "label": "AAMC — 2027 ERAS residency fees",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/fees-eras-residency-applications"
        },
        {
          "label": "AAMC — download the ERAS Residency Fee Calculator",
          "url": "https://students-residents.aamc.org/media/7711/download"
        }
      ]
    },
    {
      "number": 13,
      "title": "Use the Applicant Checklist as a final gate",
      "introduction": "The official two-page checklist is short by design. Use it after your detailed tracker, not instead of one.",
      "bullets": [
        "Research gate—Confirm ERAS participation, each program’s eligibility and deadline, citizenship or visa requirements and current-season changes.",
        "Registration gate—Use the correct token and AAMC account, and register separately with the appropriate Match service.",
        "Application gate—Complete, preview, certify and submit the common application only after understanding that most content will lock.",
        "Document gate—Distinguish upload from assignment. The MSPE, medical-school transcript and ECFMG Status Report are automatically assigned when applicable; applicant-controlled documents still require the correct workflow.",
        "Program gate—Search and save programs, verify signals before applying, and confirm all program-specific assignments.",
        "Monitoring gate—Use assignment reports and check the Message Center, email, voicemail and postal mail after applying.",
        "Print or save a clean official checklist for the final audit, but keep your detailed working tracker private."
      ],
      "links": [
        {
          "label": "AAMC — download the Residency Applicant Checklist PDF",
          "url": "https://students-residents.aamc.org/media/9721/download"
        }
      ]
    },
    {
      "number": 14,
      "title": "Pause at three gates before Apply and Pay",
      "introduction": "Certification, program-level assignment and payment are separate checkpoints with different consequences.",
      "bullets": [
        "Application gate—Before Certify and Submit, confirm every section is saved, preview the full application PDF and CV, and recheck all advisor corrections.",
        "Program gate—Before selecting a program for payment, confirm the exact specialty and track, signal and tier, personal statement, letters and exam transcript.",
        "Invoice gate—Before payment, confirm the program count by specialty, expected transcript fees, tax and billing details, then read the nonrefund rule.",
        "Do not assume certification sent the application. Certification locks the common application; program selection and payment are separate.",
        "Do not assume saving a program applied to it. Saved Programs is a staging area where many choices can still be corrected.",
        "Save the payment receipt and immediately inspect Programs Applied To and the assignment reports for the result, not merely the action you intended."
      ]
    },
    {
      "number": 15,
      "title": "Use a weekly monitoring routine after applying",
      "introduction": "A submitted application still depends on communications, document processing and status checks throughout the season.",
      "bullets": [
        "Programs Applied To—Confirm the exact programs and tracks that received an application.",
        "Assignments Checklist and Assignments Report—Look for missing personal statements, letters, photos or transcripts and compare the result with each program’s requirements.",
        "Transcript reports—Track whether requests were received and resend new scores through the correct MyERAS workflow when appropriate.",
        "Letters—Monitor upload status and remaining assignment capacity, remembering that a program is not guaranteed to review a late addition.",
        "Message Center and contact email—Check regularly, along with voicemail and postal mail. Keep Personal Information current.",
        "FAQ and announcements—Recheck when a policy, system behavior or season detail changes instead of relying on a saved screenshot.",
        "Support routing—Contact AAMC for MyERAS system issues, your Designated Dean’s Office for its processes, ECFMG for IMG-controlled tasks, FSMB or NBOME for their transcript issues and the program for its own requirements."
      ],
      "links": [
        {
          "label": "AAMC — ERAS Residency Applicant FAQs",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/faqs-eras-residency-applicants"
        }
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$The official ERAS tools work best as one system: Timeline and FAQs first, Applicant Worksheet for private offline preparation, Residency Explorer and participating-program pages for research, the Fee Calculator for budget planning, MyERAS for entry and assignment, and the Checklist and reports for verification.$conclusion$,
    $conclusion$The most protective habit is to pause before every state change. Preview before certification, verify program-level assignments before selection, inspect the invoice before payment and confirm reports immediately afterward.$conclusion$,
    $conclusion$Portal screens, program status, signals and policies can change. The original visuals in this article teach the workflow; the live AAMC resources, your Designated Dean’s Office and each residency program control the current details.$conclusion$
  ],
  $media$
  [
    {
      "sectionNumber": 2,
      "type": "image",
      "s3Url": "/guidelines/eras-tools/tool-sequence.svg",
      "altText": "Six-step visual showing the recommended order for the ERAS timeline, FAQs, Applicant Worksheet, Residency Explorer, fee calculator, MyERAS portal and checklist",
      "caption": "Original Magna-Q workflow. This is an instructional sequence, not a MyERAS screenshot."
    },
    {
      "sectionNumber": 7,
      "type": "image",
      "s3Url": "/guidelines/eras-tools/worksheet-to-portal.svg",
      "altText": "Illustrative worksheet-to-portal transfer using fictional experience data and steps to verify, save and preview",
      "caption": "Use a private worksheet, transfer one verified field at a time, save the section and preview it. The example data are fictional."
    },
    {
      "sectionNumber": 10,
      "type": "image",
      "s3Url": "/guidelines/eras-tools/program-tracker.svg",
      "altText": "Illustrative residency program tracker with eligibility, visa, signal, document, fee and final-check columns",
      "caption": "A practical tracker connects program research to signals, assignments and cost. All displayed programs and data are fictional."
    },
    {
      "sectionNumber": 14,
      "type": "image",
      "s3Url": "/guidelines/eras-tools/final-gates.svg",
      "altText": "Three verification gates for the application, program assignments and invoice before applying and paying",
      "caption": "Pause separately before certification, program selection and payment. Labels may differ from the live portal."
    }
  ]
  $media$::jsonb,
  $sources$
  [
    {
      "label": "AAMC — ERAS tools and worksheets for residency applicants",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/eras-tools-and-worksheets-residency-applicants"
    },
    {
      "label": "AAMC — 2027 MyERAS Applicant User Guide",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
    },
    {
      "label": "AAMC — 2027 ERAS Residency Timeline",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
    },
    {
      "label": "AAMC — ERAS Residency Applicant FAQs",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/faqs-eras-residency-applicants"
    },
    {
      "label": "AAMC — 2027 ERAS Applicant Worksheet",
      "url": "https://students-residents.aamc.org/media/9711/download"
    },
    {
      "label": "AAMC — Residency Explorer",
      "url": "https://students-residents.aamc.org/apply-smart-residency/residency-explorer-tool"
    },
    {
      "label": "AAMC — ERAS 2027 participating specialties and programs",
      "url": "https://systems.aamc.org/eras/erasstats/par/index.cfm"
    },
    {
      "label": "AAMC — 2027 ERAS residency fees and calculator",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/fees-eras-residency-applications"
    },
    {
      "label": "AAMC — ERAS Residency Applicant Checklist",
      "url": "https://students-residents.aamc.org/media/9721/download"
    }
  ]
  $sources$::jsonb,
  'ERAS Tools and Worksheets for Residency Applicants (AAMC web collection)',
  '2026-08-27',
  true,
  '2026-08-27 14:00:00+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
  media_count integer;
  wrong_classification_count integer;
begin
  select count(*), min(jsonb_array_length(sections)), min(jsonb_array_length(s3_media))
  into seeded_count, section_count, media_count
  from public.guidelines
  where slug = 'eras-tools-and-worksheets-residency-applicants-2027'
    and title = 'ERAS Tools and Worksheets for Residency Applicants: A Handheld 2027 Workflow'
    and classification = 'residency-and-matching'
    and published;

  select count(*)
  into wrong_classification_count
  from public.guidelines
  where slug = 'eras-tools-and-worksheets-residency-applicants-2027'
    and classification in ('usmle-step-1', 'usmle-step-2-ck', 'usmle-step-3');

  if seeded_count <> 1
    or section_count <> 15
    or media_count <> 4
    or wrong_classification_count <> 0
  then
    raise exception 'Expected one published 15-section, 4-visual residency-only ERAS tools guideline; found rows %, sections %, media %, USMLE-classified rows %', seeded_count, section_count, media_count, wrong_classification_count;
  end if;
end;
$$;

commit;
