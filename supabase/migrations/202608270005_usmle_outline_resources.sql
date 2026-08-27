begin;

alter table public.resources
  add column resource_section text not null default 'Featured resources'
    check (char_length(btrim(resource_section)) between 3 and 100),
  add column document_s3_url text check (
    document_s3_url is null
    or document_s3_url ~ '^https://'
    or document_s3_url ~ '^/assets/[a-zA-Z0-9_-]+\.pdf$'
  );

comment on column public.resources.resource_section is
  'Display subsection used to group related articles within a stage resource library.';
comment on column public.resources.document_s3_url is
  'Downloadable source PDF: either a public HTTPS/S3 URL or a deployed /assets PDF path.';

delete from public.resources
where classification = 'usmle-step-1'
  and source_document_name = 'Temporary visualization seed — safe to delete';

insert into public.resources (
  slug,
  title,
  eyebrow,
  summary,
  summary_points,
  classification,
  resource_section,
  preamble,
  sections,
  conclusion,
  s3_media,
  source_links,
  source_document_name,
  document_s3_url,
  reviewed_at,
  published,
  published_at
) values (
  'cost-of-the-usmle-route-to-match-2027',
  'The Cost of the USMLE Route to Match 2027',
  'Every fee from entering the system to residency',
  'Plan the financial route from establishing a MyIntealth account through examinations, certification, applications, ranking, and the first day of residency in July 2027.',
  array[
    'See the approximately $6,235 unavoidable floor described for a first-attempt international applicant.',
    'Compare the document’s realistic budget of about $10,815 with a difficult year reaching about $16,100.',
    'Understand which fees are fixed and which costs are most controllable.',
    'Model ERAS applications and NRMP ranks before non-refundable charges are incurred.',
    'Map major payments across the application calendar instead of treating them as one simultaneous bill.'
  ],
  'usmle-step-1',
  'USMLE outline',
  array[
    $preamble$This resource follows the PDF’s route from no involvement with the United States medical system to the first day of residency in July 2027. The document brings together charges that are normally published separately and warns that an applicant’s first estimate can be wrong by several thousand dollars.$preamble$,
    $preamble$The figures are planning aids rather than quotations. The PDF says fees change without notice, almost every fee is non-refundable, and every amount should be confirmed with the organisation charging it before payment.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Begin with the three budget anchors",
      "introduction": "The PDF builds the same route three ways so applicants can see how retakes, clinical experience, and application breadth change the total.",
      "bullets": [
        "The unavoidable floor is approximately $6,235 for an applicant testing outside the United States who passes each examination first time, applies to sixty programmes in one specialty, buys no study materials, completes no United States clinical experience, and does not travel.",
        "The realistic case is approximately $10,815 after adding question banks and self-assessments, one United States clinical rotation, one hundred programmes across two specialties, and twenty-five ranked programmes.",
        "The difficult-year scenario is approximately $16,100 after one Step 2 CK retake, one OET retake, two rotations, applications through ERAS and ResidencyCAS, and thirty ranked programmes.",
        "The document identifies retakes, United States clinical experience, and programme-list size as the three largest controllable costs.",
        "Research comes before spending because ERAS, NRMP, and Pathway charges described in the PDF are non-refundable."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Account for ECFMG and certification charges",
      "introduction": "The ECFMG-related charges begin before applications and extend to visa sponsorship after matching.",
      "bullets": [
        "The PDF lists $110 for MyIntealth account establishment, including $50 for online notarisation of the identification form.",
        "It lists $580 for the Application for ECFMG Certification and $220 for verification of the final medical diploma and final transcript.",
        "The Pathway application is listed at $945 and is non-refundable even if ECFMG determines that the applicant was ineligible for the selected Pathway.",
        "The ERAS token is listed at $185. ECFMG support for a ResidencyCAS application is a separate $185 for Emergency Medicine and Obstetrics and Gynecology applicants.",
        "After matching, the PDF lists $370 for J-1 visa sponsorship plus a separate $220 SEVIS fee.",
        "Document translation is listed at $52 per page when a document is not in English and no acceptable translation is supplied."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Budget examinations and language testing",
      "introduction": "Testing internationally adds delivery surcharges, while a retake repeats the relevant examination cost.",
      "bullets": [
        "Step 1 is listed at $695 plus a $210 international test-delivery surcharge outside the United States and Canada.",
        "Step 2 CK is listed at $695 plus a $235 international delivery surcharge.",
        "The combined Step 1 and Step 2 CK cost is listed as $1,835 internationally, compared with $1,390 when testing in the United States or Canada.",
        "Step 3 is listed at approximately $955 and is described as not required for certification; it requires a valid ECFMG Certificate.",
        "The FSMB USMLE transcript is listed at $70 once per application cycle and covers transmission to ERAS and ResidencyCAS.",
        "OET Medicine is listed at AUD 587, approximately $385, or $455 when testing in the United States. ECFMG requires the minimum score on all four sub-tests in one administration, so a shortfall in one means repeating the full examination for ECFMG purposes.",
        "The PDF specifically flags Step examination fees and surcharges for confirmation at usmle.org and usmle.fsmb.org before budgeting."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "Model application and ranking fees before submitting",
      "introduction": "Application pricing changes with programme count inside each specialty, and ranking fees appear later in the cycle.",
      "bullets": [
        "For the 2027 ERAS season, programmes 1 through 30 within a specialty are listed at $11 each; programmes 31 and above within that specialty are $30 each.",
        "The programme count resets for each specialty. The PDF gives $660 for thirty programmes in each of two specialties and $1,230 for sixty programmes in one specialty.",
        "ResidencyCAS is listed at $99 for a base application of up to eighteen programmes, with higher charges for additional programmes and a separate $185 ECFMG support fee.",
        "NRMP standard applicant registration is listed at $85 and includes up to twenty unique programme codes on the primary rank order list and up to twenty across supplemental lists combined.",
        "Each programme code beyond twenty costs $30. The PDF’s example of thirty-five ranked programmes adds $450 at certification.",
        "Late NRMP registration after 29 January 2027 adds $50, couples status costs $45, and additional charges apply to rank lists of one hundred or more.",
        "Ranking broadly can remain the right decision, but the PDF says the necessary money should be available before the 3 March 2027 certification point."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "Separate fixed costs from controllable costs",
      "introduction": "The PDF estimates roughly $2,900 as fixed entry costs and then ranks the decisions that can materially change the total.",
      "bullets": [
        "The fixed component includes the MyIntealth account, certification application, credential verification, Pathway application, ERAS token, transcript fee, and NRMP registration.",
        "Retakes have the greatest impact: the PDF says an internationally delivered Step retake adds $930 and an OET retake adds $385.",
        "Testing location changes the two international Step surcharges by a combined $445, although travel to the United States or Canada will usually cost more than the saving.",
        "Programme-list shape matters because applications beyond thirty within one specialty and ranks beyond twenty each cost $30.",
        "The PDF describes applications to programmes that do not accept international applicants, sponsor the needed visa, or fit a graduation-year limit as spending with a known return of zero.",
        "Translation can add several hundred dollars at $52 per page, and late NRMP registration adds $50 without adding value."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "Spend deliberately on preparation and clinical experience",
      "introduction": "The document does not argue for the lowest possible spending; it identifies two areas it says consistently repay themselves.",
      "bullets": [
        "Adequate Step 2 CK preparation is worth funding because the score is a principal comparison number and a retake costs more than a question bank.",
        "Genuine hands-on United States clinical experience can produce United States letters of recommendation and is described as a frequently reported differentiator between matched and unmatched international applicants.",
        "The PDF warns applicants to question services that promise outcomes because no organisation can guarantee a Match.",
        "Every requirement described can be completed directly with the responsible body at its published fee."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Map fees onto the calendar and re-verify them",
      "introduction": "The financial burden is distributed across the route, but some months concentrate several large payments.",
      "bullets": [
        "Entry fees fall near the beginning, examination charges across one to two years, application fees in September, and rank and visa fees in the following spring.",
        "The PDF identifies the September application block, at roughly $1,500 to $2,000 in one month, as the point when many applicants are caught short.",
        "ECFMG fees in the document were taken from the ECFMG Fees Overview page on 18 August 2026; AAMC rates came from the 2027 ERAS fee page and NRMP charges from the Match Fees page.",
        "Step examination fees, OET pricing, and ResidencyCAS tiers were corroborated across independent 2026 sources but were not confirmed on the issuing organisations’ pages in the same session and are flagged in the PDF.",
        "The edition schedules fee re-verification for 1 January 2027 because fees can change without notice and many organisations revise them in January."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$Treat the route as a timed financial plan rather than a single total. Secure the fixed entry costs, protect against retakes by testing when ready, research programme eligibility before paying, and reserve cash for the concentrated application and ranking periods.$conclusion$,
    $conclusion$The PDF’s figures are planning anchors, not guaranteed prices. Confirm every amount with ECFMG, USMLE/FSMB, OET, AAMC, ResidencyCAS, NRMP, or the organisation that will actually charge it.$conclusion$
  ],
  null,
  jsonb_build_array(
    jsonb_build_object('label', 'ECFMG — fees overview', 'url', 'https://www.ecfmg.org/fees/'),
    jsonb_build_object('label', 'USMLE — current examination information', 'url', 'https://www.usmle.org/'),
    jsonb_build_object('label', 'NRMP — Match fees', 'url', 'https://www.nrmp.org/intro-to-the-match/match-fees/')
  ),
  'Magna-Q_Cost_of_the_USMLE_Route_Match_2027_compressed.pdf',
  '/assets/Magna-Q_Cost_of_the_USMLE_Route_Match_2027_compressed.pdf',
  '2026-08-18',
  true,
  '2026-08-27 22:02:00+00'
),
(
  'how-to-use-nbme-exams-for-usmle-step-1',
  'How to Use NBME Exams for USMLE Step 1',
  'Use self-assessments to decide when you are ready',
  'Use CBSSA results, pass-probability trends, realistic testing conditions, and disciplined review to decide when you are safely ready for pass/fail Step 1.',
  array[
    'Treat Step 1 preparation as clearing the pass line safely rather than maximising a retired score.',
    'Understand the equated percent correct and estimated probability of passing on current CBSSA reports.',
    'Take each form timed, in one sitting, and without interruptions or reference materials.',
    'Review errors by content, retrieval, and reasoning pattern instead of simply reading explanations.',
    'Use recent trends and a comfortable margin to make the sit-or-wait decision.'
  ],
  'usmle-step-1',
  'USMLE outline',
  array[
    $preamble$Step 1 has been reported only as pass or fail for examinations taken on or after 26 January 2022. The PDF explains that this changed the purpose of practice exams: the useful question is no longer “what will I score?” but “what is the probability I pass?”$preamble$,
    $preamble$This resource follows the PDF’s method for using official NBME self-assessments as readiness measurements. It is written with international medical graduates in mind and distinguishes published NBME reporting from judgment about what margin should trigger an exam booking.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Prepare to clear the line, not maximise a score",
      "introduction": "Pass/fail reporting creates an asymmetry: there is no application benefit from a higher Step 1 score, while a failure remains permanently visible.",
      "bullets": [
        "Step 1 has no three-digit score or percentile for examinations taken on or after 26 January 2022; the reported outcome is pass or fail.",
        "A self-assessment now answers the practical sit-or-wait question by estimating the probability of passing.",
        "Once a student is safely clear of the line, extra weeks buy little because there is no score to improve.",
        "A failed Step 1 attempt remains on the transcript and is visible to residency programmes.",
        "The PDF’s central strategy is to clear Step 1 confidently once, then stop rather than continuing to chase a number that no longer exists."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Know what the official self-assessments measure",
      "introduction": "The Step 1 forms commonly called NBMEs are the Comprehensive Basic Science Self-Assessments, or CBSSAs.",
      "bullets": [
        "Each CBSSA contains 200 items and is made by the National Board of Medical Examiners, the same organisation that writes Step 1.",
        "The shared authorship makes a CBSSA particularly useful as a measurement instrument for this exam.",
        "A question bank teaches while a CBSSA measures using NBME-written material.",
        "The official free 120-question sample on usmle.org should also be used; it costs nothing.",
        "The Comprehensive Basic Science Exam, or CBSE, is administered by some medical schools and reports in the same way. The PDF says to treat that result like a CBSSA result."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Read the current score report correctly",
      "introduction": "Since 23 February 2022, CBSSA reports have replaced the three-digit prediction with two readiness measures.",
      "bullets": [
        "The equated percent correct score is a 0–100 estimate of mastered content, statistically adjusted for small differences in form difficulty.",
        "The estimated probability of passing applies specifically if the student tests within one week of taking the self-assessment.",
        "The probability model is based on examinees who actually took Step 1 within one week of a CBSSA.",
        "If Step 1 is taken five weeks later, the estimate applies less well because knowledge can move in either direction.",
        "The longitudinal report tracks progress across forms taken since February 2022 and includes a national comparison line for first-time Step 1 takers from accredited US medical schools.",
        "The comparison line is context, not a target; the objective is passing rather than beating the national average."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "Do not rely on form-ranking tables",
      "introduction": "Online tables that label one CBSSA harshest or another most predictive are not published NBME evidence.",
      "bullets": [
        "NBME does not publish form-by-form predictive validity.",
        "Online rankings are assembled from sources such as discussion threads, tutor impressions, and self-reported comparisons.",
        "Newer forms use more recently retired questions and therefore reflect the current exam’s style and difficulty more closely.",
        "Use newer forms for later readiness checks for that reason, not because an unofficial table assigned a predictive rating.",
        "NBME retires and replaces forms, so the currently available selection should be checked on MyNBME rather than inferred from an old article."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "Take every form under realistic conditions",
      "introduction": "A useful probability estimate depends on taking the assessment as an exam rather than breaking it into comfortable study sessions.",
      "bullets": [
        "Take the form timed, in one sitting, without interruptions, and without looking anything up.",
        "Use the same time of day booked for the real examination.",
        "One sitting measures both knowledge and stamina; breaking the form into chunks measures knowledge without reproducing the long, dense testing experience.",
        "The PDF notes that late-day concentration failures can matter even when knowledge is adequate.",
        "Do not take a form while ill, exhausted, or immediately after a night shift because the resulting number will not provide a useful readiness measurement."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "Review errors in three honest categories",
      "introduction": "The PDF calls the assessment the cheap part and the review the place where improvement happens.",
      "bullets": [
        "“I never learned this” indicates a genuine content gap. Return narrowly to the primary resource instead of buying another resource after a disappointing score.",
        "“I knew this and could not retrieve it” indicates a memory problem. Build a card that links the fact to its mechanism and clinical presentation, and prioritise facts missed more than once.",
        "“I knew the material and still got it wrong” indicates a reading or reasoning problem, such as answering for the disease instead of the mechanism or choosing incorrectly between two plausible options.",
        "For reasoning errors, write one sentence identifying what the question tested, then explain why each wrong option is wrong.",
        "Review correct answers as well because a correct guess still represents a gap and may not succeed again.",
        "The PDF advises going narrower rather than wider after a weak result and warns against adding a third resource late in preparation."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Make readiness decisions from margin and trend",
      "introduction": "NBME publishes a probability estimate but does not publish a specific probability that means a student should sit the examination.",
      "bullets": [
        "The probability of passing on the report is the readiness figure the PDF says matters because it is based on real examinee data.",
        "Any specific go threshold is judgment rather than published NBME guidance.",
        "The PDF recommends a comfortable margin on a recent form, ideally confirmed twice, because the downside of failure is permanent while the upside of a higher practice result is capped.",
        "Trend is more useful than one isolated number. Three steadily rising forms are stronger evidence than one high result surrounded by weak ones.",
        "Unstable results can indicate pacing, fatigue, or uneven gaps sampled differently across forms.",
        "A low early baseline is a starting point rather than a prediction. What matters is where the trend ends.",
        "Once recent forms show a safe margin, stop; delaying can cost time, money, momentum, and for some international graduates an application cycle."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "Apply the IMG-specific checks",
      "introduction": "The PDF identifies registration, certification status, budgeting, language-related pacing, and score priorities that are particularly relevant to international graduates.",
      "bullets": [
        "Since 12 January 2026, USMLE examination services for international medical graduates have been provided through FSMB at usmle.fsmb.org rather than ECFMG through MyIntealth.",
        "ECFMG still confirms eligibility while FSMB handles registration, payment, score reports, and customer service.",
        "Before booking, the Application for ECFMG Certification should show as accepted. A student who graduated after acceptance must have the application updated and credentials verified or registration can be blocked.",
        "Budget the examination fee, international delivery surcharge, and self-assessments in advance so the number of forms is not decided emotionally late in preparation.",
        "If English is not the first language, track whether long stems create reading-speed errors and whether the final questions in blocks are consistently rushed.",
        "Programmes see pass or fail for Step 1, so the PDF advises getting safely through Step 1 and directing score-maximising effort toward Step 2 CK."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Avoid the most common assessment mistakes",
      "introduction": "The recurring mistakes in the PDF all weaken the reliability of the readiness decision or waste limited preparation time.",
      "bullets": [
        "Do not study Step 1 to maximise a score that is no longer reported.",
        "Do not take a form untimed and then trust its probability as if it represented exam conditions.",
        "Do not hoard the newest forms while repeatedly postponing the readiness check.",
        "Do not panic over an early baseline or add a new resource immediately after one weak result.",
        "Do not treat a question-bank percentage as equivalent to a CBSSA result; they are different instruments used for different purposes.",
        "Do not leave the final form until two days before the examination because there is no meaningful time to act on the result.",
        "The PDF suggests at least three or four forms to establish a trend; one result is not a trend and two barely establish one.",
        "One failed practice form, particularly an early form, does not determine whether to postpone. Recent trends below the line are the stronger reason to delay."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$Use official self-assessments as measurements: take them under realistic conditions, review every error honestly, and follow the direction of several recent results rather than reacting to one number.$conclusion$,
    $conclusion$The goal is disciplined and bounded—reach a comfortable, repeatable probability of passing, sit Step 1 once, and stop when you are safely across the line.$conclusion$
  ],
  null,
  jsonb_build_array(
    jsonb_build_object('label', 'NBME — self-assessment information', 'url', 'https://www.nbme.org/'),
    jsonb_build_object('label', 'USMLE — Step 1 and official sample materials', 'url', 'https://www.usmle.org/'),
    jsonb_build_object('label', 'FSMB — USMLE services', 'url', 'https://usmle.fsmb.org/')
  ),
  'Magna-Q_How_to_Use_NBME_Exams_Step_1_compressed.pdf',
  '/assets/Magna-Q_How_to_Use_NBME_Exams_Step_1_compressed.pdf',
  '2026-08-27',
  true,
  '2026-08-27 22:01:00+00'
);

do $$
declare
  outline_count integer;
  temporary_step_one_count integer;
begin
  select count(*)
  into outline_count
  from public.resources
  where classification = 'usmle-step-1'
    and resource_section = 'USMLE outline'
    and published
    and document_s3_url is not null;

  select count(*)
  into temporary_step_one_count
  from public.resources
  where classification = 'usmle-step-1'
    and source_document_name = 'Temporary visualization seed — safe to delete';

  if outline_count <> 2 or temporary_step_one_count <> 0 then
    raise exception
      'Expected two published USMLE outline resources and no temporary Step 1 resources; found % outline and % temporary',
      outline_count,
      temporary_step_one_count;
  end if;
end;
$$;

commit;
