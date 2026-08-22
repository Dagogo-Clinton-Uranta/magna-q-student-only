begin;

with revised_articles (
  old_slug,
  new_slug,
  title,
  excerpt,
  paragraph_1,
  paragraph_2,
  paragraph_3,
  paragraph_4,
  category,
  source_links,
  published_at
) as (
  values
  (
    'step-1-after-pass-fail',
    'usmle-2026-portal-transition-for-imgs',
    'The USMLE Portal Moved in 2026: What IMGs Must Do Differently',
    'Since January 2026, international medical graduates use FSMB—not MyIntealth—for USMLE applications, score reports, and exam customer service. ECFMG certification remains a separate and essential process.',
    $article$The most important 2026 USMLE administrative change for international medical graduates (IMGs) is not a new medical topic; it is a new division of responsibility. ECFMG is the organization that evaluates whether an IMG meets the requirements for ECFMG Certification. The Federation of State Medical Boards (FSMB) and NBME co-sponsor the USMLE. Since January 12, 2026, FSMB has handled all USMLE Step exam services for IMGs, including exam applications, registration, score reports, and USMLE customer service. Those exam services are no longer available through ECFMG's MyIntealth portal.$article$,
    $article$The move did not abolish ECFMG Certification or transfer certification to FSMB. ECFMG still determines an IMG's eligibility for certification, and passing Step 1 and Step 2 CK remains part of the certification process. When an IMG applies for a Step exam through FSMB, FSMB confirms eligibility with ECFMG. This creates two connected workflows: use MyIntealth for ECFMG certification and credential-related services, but use FSMB's USMLE portal for the Step examination journey. A candidate who treats the new FSMB account as a replacement for ECFMG certification has misunderstood the change.$article$,
    $article$The broader service transition also centralized services for U.S. medical school students and graduates. On January 26, 2026, Step 3 services that FSMB had provided to that group moved to NBME's MyUSMLE portal; NBME already handled their Step 1 and Step 2 CK services. Practical risk control matters more than memorizing every organization: verify which portal applies to your school type, keep the same identifying information across accounts, download permits before test day, save every confirmation, and check the current USMLE transition hub before paying or requesting a service. Portal ownership can change while eligibility rules remain the same.$article$,
    $article$What does this mean for you: Treat administrative accuracy as part of professional competence. For exams, make a one-page account map listing your USMLE ID, ECFMG/Intealth tasks, FSMB tasks, deadlines, permits, and support contacts. In a residency interview, you do not need to recite portal history. You can sound prepared by explaining that you independently tracked the 2026 transition, separated exam registration from ECFMG certification, and used official sources to prevent delays. That answer demonstrates reliability, attention to detail, and ownership—qualities programs value in residents.$article$,
    'Step 1',
    '[
      {"title":"USMLE Service Transition Information Hub","url":"https://www.usmle.org/usmle-service-transition"},
      {"title":"Intealth: Phase One of the transition completed January 12, 2026","url":"https://www.intealth.org/news/2026/01/12/phase-one-of-usmle-service-transition-is-complete-all-usmle-step-exam-services-for-imgs-now-managed-by-fsmb/"},
      {"title":"MyIntealth transition frequently asked questions","url":"https://www.ecfmg.org/myintealth/faqs.html"}
    ]'::jsonb,
    '2026-08-16 12:00:00+00'::timestamptz
  ),
  (
    'step-2-ck-new-testing-rhythm',
    'usmle-2026-new-software-and-shorter-blocks',
    'Thirty-Minute Blocks: The 2026 USMLE Software Change Explained',
    'USMLE introduced updated delivery software across all three Step exams in 2026. The medical content and total testing time did not change, but block structure, navigation, and the rhythm of exam day did.',
    $article$USMLE introduced new test-delivery software for Step 3 on March 10, Step 2 CK on May 7, and Step 1 on May 14, 2026. The interface has an updated design, improved keyboard navigation, a settings menu, and image-contrast controls. The change also brings the live exams closer to the software already used in NBME self-assessments and other practice materials. Candidates should use the official interactive testing experience for their specific Step rather than relying on screenshots, recollections, or an old tutorial.$article$,
    $article$The largest practical change is the shift to shorter multiple-choice blocks. Step 1 now uses fourteen 30-minute blocks with up to 20 items per block instead of seven 60-minute blocks. Step 2 CK uses sixteen 30-minute blocks with about 18 to 20 items per block instead of eight 60-minute blocks. Step 3 Day 1 uses twelve 30-minute blocks, while Day 2 uses nine 30-minute multiple-choice blocks plus the existing computer-based case simulations. Overall exam-day length and maximum total item counts did not increase because of the software change.$article$,
    $article$USMLE explicitly says the update does not change what candidates should study. It changes how they should rehearse. Once a block is closed, a candidate still cannot return to it. More frequent block endings therefore create more moments to reset attention, manage breaks, and let go of a difficult question. Practice should include the new interface, timed 30-minute sets, deliberate break decisions, and at least one realistic long-day simulation. Do not assume that doubling the number of blocks doubles the number of optional breaks; learn the official break-time rules and tutorial before test day.$article$,
    $article$What does this mean for you: Keep your content plan evidence-based, but update the conditions under which you practice. Use 30-minute blocks to train rapid reorientation: pause, reset posture and attention, then begin the next block without carrying frustration forward. For residency interviews, the stronger story is not “the test became easier” or “harder”—USMLE says the content and duration did not change. Say that you noticed a systems change, adapted your workflow, and protected performance through deliberate rehearsal. That demonstrates composure and adaptability without overstating the policy.$article$,
    'Step 2 CK',
    '[
      {"title":"USMLE: Test Delivery Software Updates for Step 2 CK and Step 1","url":"https://www.usmle.org/test-delivery-software-updates-step-2-ck-and-step-1-coming-may-2026"},
      {"title":"USMLE official exam resources and 2026 formats","url":"https://www.usmle.org/exam-resources"}
    ]'::jsonb,
    '2026-08-17 12:00:00+00'::timestamptz
  ),
  (
    'step-3-thinking-independently',
    '2026-match-results-and-img-workforce',
    'The 2026 Match Was the Largest Yet: What the Numbers Say About IMGs',
    'The 2026 Main Residency Match set records for applicants and positions. The results show a growing training pipeline and a major IMG contribution, but aggregate national data should not be mistaken for an individual prediction.',
    $article$NRMP reported that the 2026 Main Residency Match was the largest in its history: more than 53,000 applicants registered, 44,344 positions were offered across more than 6,800 program tracks, and more than 93% of positions filled. After the matching algorithm ran, 2,862 positions across 941 programs remained unfilled—389 more positions than in the previous year—and eligible applicants could pursue unfilled positions through SOAP. These figures describe the national system; they do not reveal whether a particular applicant will match a particular specialty or program.$article$,
    $article$Intealth's March 2026 analysis, using NRMP data, reported that IMGs matched to 9,682 first-year positions and represented about 23.6% of all matched applicants. That included 2,949 U.S.-citizen IMGs and a record 6,733 non-U.S.-citizen IMG matches. Intealth reported a 70.0% match rate for U.S. IMGs and 56.4% for non-U.S. IMGs. IMG representation was especially substantial in first-year categorical Internal Medicine, Pediatrics, Pathology, and Neurology. These are population-level outcomes, not promises, and specialty competitiveness, application quality, visa needs, geography, and program fit still matter.$article$,
    $article$The 2027 cycle also requires applicants to separate application activity from NRMP participation. Programs update information in the NRMP Program Directory, applicants apply through the service each program requires, and applicants separately register in NRMP's R3 system. For the 2027 Match, applicant registration opens September 15, 2026; ranking opens February 1, 2027; rank certification closes March 3 at 9 p.m. ET; and Match Week runs March 15–19. The lesson from both the statistics and the process is to build a broad, evidence-informed strategy without treating one national percentage as personal destiny.$article$,
    $article$What does this mean for you: Use the data to develop a credible workforce narrative, not to boast about odds. An IMG interviewing in Internal Medicine might say, “The 2026 results reinforced how much U.S. care depends on internationally trained physicians, especially in high-need fields. I want to contribute, but I also know contribution requires adapting to the local system, communicating reliably, and serving the actual community.” Pair that awareness with specific program research and a real example of service or teamwork. That sounds informed and grounded rather than rehearsed.$article$,
    'Residency Interviews',
    '[
      {"title":"NRMP: Results of the 2026 Main Residency Match","url":"https://www.nrmp.org/about/news/2026/03/nrmp-releases-results-of-the-2026-main-residency-match-for-more-than-38000-future-residents/"},
      {"title":"Intealth: IMG outcomes in the 2026 Match","url":"https://www.intealth.org/news/2026/03/23/imgs-continue-to-strengthen-u-s-health-care-in-2026-residency-match/"},
      {"title":"NRMP 2027 applicant checklist and Match guidance","url":"https://www.nrmp.org/residency-applicants/"}
    ]'::jsonb,
    '2026-08-18 12:00:00+00'::timestamptz
  ),
  (
    'new-york-residency-interview-fit',
    'medicaid-work-requirements-2026-explained',
    'Medicaid Work Requirements: A 2026 Policy Change Clinicians Will Feel',
    'A June 2026 CMS rule created a national framework for Medicaid community-engagement requirements. The eligibility change is administrative, but its consequences may appear in clinics through coverage gaps and documentation burdens.',
    $article$Medicaid is the joint federal-state insurance program that covers many people with low incomes and certain other eligible groups. On June 1, 2026, the Centers for Medicare & Medicaid Services (CMS) issued an interim final rule implementing a statutory “community engagement,” or work, requirement. Certain adults ages 19 through 64 in the Medicaid expansion group or specified demonstration programs will have to document 80 hours per month of employment, education, a work program, community service, or a permitted combination. States generally must implement the requirement by January 1, 2027, although some may act sooner.$article$,
    $article$The rule does not apply to every Medicaid beneficiary. CMS lists exemptions that include pregnancy or postpartum coverage, disability or medical frailty, certain parents and caregivers, American Indians and Alaska Natives, some veterans, and people participating in drug or alcohol treatment, among others. States must attempt verification, notify a person when compliance cannot be confirmed, and provide 30 days to respond before denial or disenrollment. States can also establish short-term hardship exceptions for circumstances such as inpatient care, disasters, high local unemployment, or necessary travel for complex medical care.$article$,
    $article$There is an important policy disagreement to understand. CMS describes the framework as a way to promote work, education, independence, and program accountability. The AAMC argues that portions of the rule—especially its narrow approach to “medical frailty” and limits on continued self-attestation—go beyond the statute and could jeopardize coverage while increasing paperwork for patients, clinicians, and states. Those are competing interpretations, and implementation evidence is still developing. A clinically relevant possibility is that eligible patients may arrive with interrupted medication access, delayed follow-up, or requests for documentation; that is a risk to watch, not a claim that every patient will lose coverage.$article$,
    $article$What does this mean for you: Learn to discuss health policy through patient care rather than party slogans. In an interview, acknowledge the stated policy goal, then identify the bedside issue: “I would want to know whether a missed visit reflects nonadherence or a coverage and verification barrier, involve social work early, and document qualifying limitations accurately without making legal promises.” For USMLE-style reasoning, remember that insurance status and social conditions can affect access, continuity, and discharge planning. Showing that you can connect policy to safe, nonjudgmental care signals systems-based competence.$article$,
    'Residency Interviews',
    '[
      {"title":"CMS fact sheet: Medicaid Community Engagement Requirement","url":"https://www.cms.gov/newsroom/fact-sheets/medicaid-community-engagement-requirement-certain-individuals-interim-final-rule-comment-period-cms"},
      {"title":"AAMC response to the CMS Medicaid work-requirements rule","url":"https://www.aamc.org/advocacy-policy/washington-highlights/aamc-raises-concern-over-medicaid-community-engagement-interim-final-rule"}
    ]'::jsonb,
    '2026-08-19 12:00:00+00'::timestamptz
  ),
  (
    'texas-residency-interview-questions',
    'federal-medical-funding-2026-enacted-versus-proposed',
    'U.S. Medical Funding in 2026: What Passed, What Was Proposed, and Why It Matters',
    'The 2026 funding story is not one simple cut. Congress enacted health and research support in February, while later proposals sought reductions elsewhere. Applicants should distinguish settled law from ongoing budget negotiations.',
    $article$Federal health-budget news can be confusing because an enacted appropriation, an agency payment proposal, and an advocacy statement have different legal weight. On February 3, 2026, the Consolidated Appropriations Act, 2026 became law and funded the National Institutes of Health (NIH) for the fiscal year. The AAMC welcomed new NIH funding and several temporary extensions: Medicare telehealth flexibilities through December 31, 2027; the Acute Hospital Care at Home program through September 30, 2030; a two-year delay of scheduled Medicaid Disproportionate Share Hospital cuts; and support for community health centers, workforce programs, and Teaching Health Center graduate medical education.$article$,
    $article$The direction changed in later budget proposals. The administration's April 2026 request for fiscal year 2027 proposed lower support for NIH, public health, and health-professions programs. NIH budget tables showed a proposed reduction of about $3.86 billion in comparable budget authority from the fiscal year 2026 enacted level, while the AAMC highlighted a proposed $1.02 billion reduction to health-workforce programs and proposed elimination of multiple Title VII and VIII training programs. A president's budget request expresses priorities; Congress must still pass appropriations before those numbers become law.$article$,
    $article$Congressional action remained mixed as of August 21. In June, the House Appropriations Committee advanced a fiscal year 2027 bill that would preserve NIH funding and support several workforce programs, while the AAMC objected to proposed reductions or eliminations affecting the CDC, public-health training centers, the Agency for Healthcare Research and Quality, and patient-centered outcomes research. Separately, CMS proposed 2027 outpatient-payment changes that the AAMC said could reduce support for teaching hospitals and 340B providers. These items were proposals or committee actions at the time of writing, so a responsible reader should keep watching the final rulemaking and appropriations process.$article$,
    $article$What does this mean for you: In interviews, accuracy about policy status is more impressive than a dramatic opinion. Use words such as “enacted,” “proposed,” and “under congressional consideration” correctly. Then connect funding to patients: research budgets affect which questions can be studied; workforce programs affect who trains and where; hospital payment affects access to complex and safety-net care. A concise answer might be, “I follow funding because it shapes the system in which clinical choices occur, but I verify whether a headline describes law or a proposal before drawing conclusions.” That demonstrates judgment and intellectual honesty.$article$,
    'Step 3',
    '[
      {"title":"AAMC statement on the enacted FY 2026 Labor-HHS appropriations bill","url":"https://www.aamc.org/news/press-releases/aamc-statement-passage-fy-2026-labor-hhs-appropriations-bill"},
      {"title":"NIH FY 2027 budget overview with FY 2026 enacted comparison","url":"https://officeofbudget.od.nih.gov/pdfs/FY27/br/Consolidated%20Overview%20of%20FY%202027%20Budget.pdf"},
      {"title":"AAMC statement on the FY 2027 president''s budget request","url":"https://www.aamc.org/news/press-releases/aamc-statement-president-s-budget-request-fy-2027"},
      {"title":"AAMC statement on the House committee FY 2027 Labor-HHS bill","url":"https://www.aamc.org/news/press-releases/aamc-statement-passage-full-committee-fy-2027-labor-hhs-appropriations-bill"},
      {"title":"AAMC statement on the proposed CY 2027 hospital outpatient rule","url":"https://www.aamc.org/news/press-releases/aamc-statement-cy-2027-hospital-opps-proposed-rule"}
    ]'::jsonb,
    '2026-08-20 12:00:00+00'::timestamptz
  ),
  (
    'california-virtual-interview-presence',
    'three-us-medical-research-signals-2026',
    'Three U.S. Research Signals From 2026—and How Not to Overstate Them',
    'A long-term prediabetes trial, a mechanistic Long COVID study, and AI-designed antibiotic candidates could influence American medicine. Their evidence levels—and therefore their immediate clinical meaning—are very different.',
    $article$New research becomes clinically useful at different speeds. A randomized long-term human study can reinforce care today, while an animal experiment may only justify the next experiment. Three U.S.-led findings reported by NIH in June 2026 illustrate that range. They concern lifestyle intervention for people with prediabetes, possible nervous-system autoantibodies in a subset of people with Long COVID, and artificial intelligence used to optimize potential antibiotic peptides. None should be summarized with the single word “breakthrough” without explaining the evidence.$article$,
    $article$The most practice-ready result came from extended follow-up of the U.S. Diabetes Prevention Program. Among 1,173 adults at high risk of diabetes whose data could be linked with Medicare claims, the original intensive lifestyle group had a 21% lower risk of developing two chronic conditions and a 25% lower risk of developing three compared with placebo over more than two decades. Metformin did not produce a statistically significant reduction in this particular multimorbidity outcome. That does not mean metformin is ineffective for diabetes prevention or treatment; it means this analysis did not show a significant benefit for the broader outcome studied.$article$,
    $article$The other findings are earlier-stage. A Yale- and Mount Sinai-led study linked nervous-system-reactive autoantibodies with symptom patterns in some people with neurological Long COVID, and experiments transferring selected patient antibodies into mice supported a possible causal role. The authors and NIH emphasized that validation is needed before the finding can guide diagnosis or treatment. Separately, University of Pennsylvania researchers used an AI system called ApexGo to redesign antibacterial peptides. Many optimized candidates performed better in laboratory testing, and selected peptides worked in infected mice. That is a promising drug-development method, not an approved antibiotic and not a reason to change current prescribing.$article$,
    $article$What does this mean for you: Practice an evidence ladder whenever you discuss new science: identify the population, design, comparator, outcome, and whether the result is observational, mechanistic, animal-based, or ready for clinical use. For Step 2 CK and Step 3, the immediate lesson is still evidence-based prevention, antimicrobial stewardship, and avoiding unvalidated tests or treatments. In interviews, say what excites you and what remains unknown in the same answer. A candidate who can be curious without exaggerating demonstrates scientific maturity—far more convincingly than someone who repeats a headline as settled medicine.$article$,
    'Step 2 CK',
    '[
      {"title":"NIH: Lifestyle intervention and multimorbidity in adults with prediabetes","url":"https://www.nih.gov/news-events/news-releases/adults-prediabetes-lifestyle-intervention-lowered-risk-developing-multiple-chronic-conditions"},
      {"title":"NIH: Nervous-system autoantibodies in some Long COVID patients","url":"https://www.nih.gov/news-events/nih-research-matters/immune-system-may-attack-nervous-system-some-long-covid-patients"},
      {"title":"NIH: AI tool for antibiotic-peptide development","url":"https://www.nih.gov/news-events/nih-research-matters/ai-tool-could-speed-antibiotic-development"}
    ]'::jsonb,
    '2026-08-21 12:00:00+00'::timestamptz
  )
)
update public.blog_posts as post
set
  slug = revised.new_slug,
  title = revised.title,
  excerpt = revised.excerpt,
  content = concat_ws(
    E'\n\n',
    revised.paragraph_1,
    revised.paragraph_2,
    revised.paragraph_3,
    revised.paragraph_4
  ),
  paragraph_1 = revised.paragraph_1,
  paragraph_2 = revised.paragraph_2,
  paragraph_3 = revised.paragraph_3,
  paragraph_4 = revised.paragraph_4,
  category = revised.category,
  source_links = revised.source_links,
  relevant_link = revised.source_links->0->>'url',
  link_title = 'Sources and further reading',
  published_at = revised.published_at,
  updated_at = now()
from revised_articles as revised
where post.slug = revised.old_slug;

do $$
declare
  revised_count integer;
begin
  select count(*)
  into revised_count
  from public.blog_posts
  where slug in (
    'usmle-2026-portal-transition-for-imgs',
    'usmle-2026-new-software-and-shorter-blocks',
    '2026-match-results-and-img-workforce',
    'medicaid-work-requirements-2026-explained',
    'federal-medical-funding-2026-enacted-versus-proposed',
    'three-us-medical-research-signals-2026'
  );

  if revised_count <> 6 then
    raise exception 'Expected to revise 6 community blog posts, revised %', revised_count;
  end if;
end;
$$;

commit;
