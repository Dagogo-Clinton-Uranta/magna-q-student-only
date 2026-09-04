begin;

-- Research is a cross-stage resource section. The resources table currently
-- models stage visibility through one classification per row, so publish the
-- same editorial article once for each of the four student stages.
with classifications (classification, slug) as (
  values
    ('usmle-step-1', 'from-research-beginner-to-published-author-step-1'),
    ('usmle-step-2-ck', 'from-research-beginner-to-published-author-step-2-ck'),
    ('usmle-step-3', 'from-research-beginner-to-published-author-step-3'),
    ('residency-and-matching', 'from-research-beginner-to-published-author-residency-match')
),
article as (
  select
    'From Research Beginner to Published Author'::text as title,
    'A practical path into medical research'::text as eyebrow,
    $summary$A step-by-step field guide for medical students and international doctors who want to join a credible research team, choose a feasible first project, and carry the work from a focused question through ethical review, analysis, peer review, and honest presentation on a residency application.$summary$::text as summary,
    array[
      'Choose an achievable first project and a focused clinical niche.',
      'Find productive mentors and write outreach that offers useful help.',
      'Move from a research question to a protocol, approvals, and clean data.',
      'Write, submit, revise, and discuss a manuscript with confidence.',
      'Build an honest scholarly record instead of chasing publication counts.'
    ]::text[] as summary_points,
    'Research'::text as resource_section,
    array[
      $preamble$Research can feel like a closed room when you have never joined a lab, written a protocol, or opened a statistical program. It is not. The first project is difficult because every doorway is unfamiliar; once the sequence becomes visible, the work is far less mysterious.$preamble$,
      $preamble$This guide is written for the medical student or international doctor starting with little or no formal experience. It covers both routes into established U.S. teams and projects that can begin in your own institution or remotely. Research does not change your eligibility to sit the USMLE, and no publication guarantees a residency interview or Match result. Its real value is the habit of asking careful questions, doing accountable work, and explaining what you learned.$preamble$,
      $preamble$Policies, program eligibility, journal requirements, and application formats change. Use the linked primary sources, your institution’s research office, and the target journal’s current instructions before acting.$preamble$
    ]::text[] as preamble,
    $sections$
    [
      {
        "number": 1,
        "title": "Begin with the right ambition",
        "introduction": "The useful goal is not to collect papers. It is to become someone who can help answer a clinical question responsibly.",
        "bullets": [
          "Research can strengthen the scholarly story you later present in applications and interviews, but it is one part of a broader record. NRMP outcome reports describe associations across groups; they do not predict what will happen to an individual applicant.",
          "Aim for depth you can defend: a clear question, a meaningful contribution, command of the methods, and an honest account of the result. One project you understand thoroughly can teach more than several papers on which your role was nominal.",
          "Choose a theme broad enough to grow with you. An Internal Medicine applicant might explore cardiovascular outcomes; a Psychiatry applicant might focus on addiction care; a Surgery applicant could study postoperative complications.",
          "Write a one-sentence intention before searching for opportunities: ‘Over the next year, I want to learn clinical outcomes research in heart failure and contribute to at least one project from protocol to submission.’"
        ],
        "links": [
          {
            "label": "NRMP Charting Outcomes for IMGs",
            "url": "https://www.nrmp.org/wp-content/uploads/2024/09/Charting_Outcomes_IMG2024.pdf"
          }
        ]
      },
      {
        "number": 2,
        "title": "Choose an entry route that fits your life",
        "introduction": "There is no single national application for ‘IMG research.’ Most opportunities sit inside a department, laboratory, degree program, or individual investigator’s team.",
        "bullets": [
          "A full-time research fellow, assistant, or coordinator role suits someone able to spend six to twenty-four months in one institution. Responsibilities may include chart review, recruitment, REDCap, regulatory work, data cleaning, analysis, and manuscript preparation.",
          "Direct collaboration with a principal investigator can begin remotely or locally. Systematic reviews, meta-analyses, survey projects, bibliometric studies, public-dataset analyses, and manuscript work are often possible without immediate access to a U.S. hospital.",
          "A project at home is still real scholarship. Work completed in Nigeria, Ghana, India, Pakistan, Brazil, the United Kingdom, or elsewhere can demonstrate rigor and clinical insight, especially when it addresses a problem relevant to the local population.",
          "Formal graduate training is a separate commitment. A master’s or Ph.D. can be right for a future physician-scientist, but it is an expensive detour if the only objective is to add publications before residency.",
          "Read eligibility rules before applying. Programs carrying similar names may be intended for undergraduates, enrolled graduate students, current residents, or postdoctoral scientists rather than medical graduates seeking a pre-residency research year."
        ],
        "links": []
      },
      {
        "number": 3,
        "title": "Pick a first project you can finish",
        "introduction": "A beginner needs a project with a sensible question, available supervision, and a finish line that fits the calendar.",
        "bullets": [
          "A case report can teach literature review and scientific writing, but it usually requires legitimate access to the patient and a genuinely instructive clinical lesson.",
          "A systematic review is accessible from many locations, yet it is not an extended essay. It requires a predefined question, reproducible search, dual screening where feasible, structured extraction, risk-of-bias assessment, and transparent reporting.",
          "A meta-analysis adds quantitative synthesis. Do not attempt one merely because it sounds impressive; incompatible studies, poor extraction, or weak statistical judgment can make the pooled number misleading.",
          "Retrospective chart reviews and large-database studies can answer important outcomes questions but demand data access, governance, careful variable definitions, and statistical support.",
          "Cross-sectional surveys and quality-improvement projects can be practical local starting points. Randomized trials generally require funding, infrastructure, registration, monitoring, and experienced oversight beyond what a first-time researcher should manage alone."
        ],
        "links": []
      },
      {
        "number": 4,
        "title": "Narrow the question before chasing a mentor",
        "introduction": "‘I am interested in medical research’ gives a prospective mentor nothing to work with. A defined area makes both your search and your introduction sharper.",
        "bullets": [
          "Move from specialty to area to problem: Internal Medicine → cardiology → heart failure → readmission and health disparities. The final layer should describe a question, population, or outcome rather than a fashionable topic.",
          "Use recent reviews and the final paragraphs of original papers to find disagreements, limitations, neglected populations, inconsistent guidelines, and unanswered follow-up questions.",
          "Search broadly, then tighten the terms. ‘Heart failure’ can become ‘heart failure AND 30-day readmission AND socioeconomic status.’ Keep a short search log so you can reproduce useful searches.",
          "Frame an answerable clinical question with PICO when appropriate: population, intervention or exposure, comparison, and outcome. ‘Does technology help?’ becomes ‘Among adults discharged after heart-failure admission, does remote monitoring reduce 30-day readmission compared with usual follow-up?’",
          "Pressure-test the idea. Ask whether the answer is already known, whether the data exist, whether the result would matter, and whether the study can be completed with your time and resources."
        ],
        "links": [
          {
            "label": "Search PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/"
          }
        ]
      },
      {
        "number": 5,
        "title": "Learn the small toolkit that makes you useful",
        "introduction": "A new researcher earns trust by solving ordinary bottlenecks reliably, not by declaring a passion for scholarship.",
        "bullets": [
          "Start with study designs, basic biostatistics, literature searching, research ethics, reference management, and scientific writing. Learn enough to understand why a method is chosen, not simply how to click through software.",
          "Build one practical skill at a time: PubMed searching, Zotero or EndNote, Covidence or another screening workflow, REDCap, clean spreadsheet design, and basic analysis in R, Python, SPSS, Stata, or SAS.",
          "Create evidence of competence. A drafted search strategy, calibrated screening exercise, data dictionary, reproducible cleaning script, or well-edited introduction is more persuasive than a long list of tools on a CV.",
          "Never claim proficiency you cannot demonstrate. ‘Learning R and able to clean tabular data with supervision’ is more credible than ‘advanced statistical programmer’ after one online course.",
          "Useful offers are concrete: ‘I can screen abstracts consistently, manage references, build an extraction sheet, and commit six hours each week.’"
        ],
        "links": []
      },
      {
        "number": 6,
        "title": "Find investigators who actually mentor",
        "introduction": "Fame is not the same as availability. Look for an active group whose work and working style give a beginner room to contribute.",
        "bullets": [
          "Search recent PubMed papers, department faculty pages, conference programs, specialty societies, and NIH RePORTER. Track investigators whose current work overlaps with your niche.",
          "Read two or three recent papers from each person. Note the diseases, datasets, study designs, recurring junior authors, publication pace, and questions the group returns to.",
          "Do not email only department chairs and celebrity scientists. Assistant professors, associate professors, newer principal investigators, and productive clinical faculty may have active projects and more capacity for close mentorship.",
          "Look beyond output. A promising mentor sets expectations, gives feedback, includes trainees in substantive work, and can explain how a small assignment fits the larger study.",
          "Keep a simple outreach sheet with investigator, institution, research theme, relevant paper, contact date, follow-up date, response, and next action."
        ],
        "links": [
          {
            "label": "Search funded work in NIH RePORTER",
            "url": "https://reporter.nih.gov/search/REPORTER_HOME.do"
          }
        ]
      },
      {
        "number": 7,
        "title": "Write a cold email worth answering",
        "introduction": "The strongest message is brief, specific, and useful. It shows that you know whom you are contacting and makes a modest request.",
        "bullets": [
          "Use a subject line with substance, such as ‘Research collaboration — heart-failure outcomes.’ Address the investigator correctly and introduce your current role in one sentence.",
          "Name one recent paper and the idea that caught your attention. Empty praise is easy to spot; a precise observation proves that the email is not a mass mailing.",
          "State what you can contribute now—literature searching, screening, extraction, chart abstraction, data cleaning, basic analysis, figures, or drafting—and give a realistic weekly commitment.",
          "Make one clear request: a short conversation about contributing to an existing project, including remote work if appropriate. Attach a clean one- or two-page research CV.",
          "A workable core reads: ‘I recently read your study of socioeconomic predictors of heart-failure readmission. I have experience with literature screening and basic analysis in R, and I would be grateful for an opportunity to support an existing outcomes project.’",
          "Follow up once after seven to fourteen days. Silence is common; move to the next well-researched contact rather than sending repeated messages or taking the lack of response personally."
        ],
        "links": []
      },
      {
        "number": 8,
        "title": "Set the working agreement before the work expands",
        "introduction": "Early clarity prevents months of confusion about ownership, deadlines, communication, and credit.",
        "bullets": [
          "Confirm the project question, your first assignment, expected hours, supervision, meeting cadence, tools, data-access rules, and the next checkpoint. Put the agreed actions in a short follow-up email.",
          "Discuss authorship while roles are still being assigned. ICMJE’s framework requires substantive contribution, participation in drafting or critical review, final approval, and accountability; an isolated administrative task does not automatically earn authorship.",
          "Ask how author order will be revisited if responsibilities change. Use a contributorship record so screening, analysis, writing, supervision, and other work remain visible.",
          "Never buy a place on a manuscript or accept gift authorship. A name on work you cannot explain is both an ethical problem and a vulnerability in an interview.",
          "Reliability becomes your reputation: meet deadlines, flag delays early, preserve version history, ask focused questions, and return work that another team member can audit."
        ],
        "links": [
          {
            "label": "ICMJE authorship and contributorship guidance",
            "url": "https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html"
          }
        ]
      },
      {
        "number": 9,
        "title": "Turn the idea into a protocol",
        "introduction": "A protocol makes the study inspectable before the team becomes attached to a particular result.",
        "bullets": [
          "Write the background, knowledge gap, objective, and hypothesis where appropriate. The objective should specify the population, exposure or intervention, comparison, outcome, setting, and relevant period.",
          "Define inclusion and exclusion criteria, variables, primary and secondary outcomes, data source, missing-data approach, and planned analyses. Ambiguous definitions become arguments during extraction and bias during analysis.",
          "Name who will do each task and when. Include approvals, data access, screening or collection, analysis, drafting, internal review, conference deadlines, and journal submission.",
          "Discuss sample size and statistical power before collecting data. The calculation may depend on effect size, event rate, variance, alpha, desired power, and expected loss or missingness.",
          "Ask a statistician for design advice early when the analysis is unfamiliar. Statistics cannot rescue a vague outcome, biased sampling, or an underpowered study after the dataset is complete."
        ],
        "links": []
      },
      {
        "number": 10,
        "title": "Secure ethics review and register when required",
        "introduction": "The institution—not the eager investigator—decides whether work with people, identifiable data, or biospecimens needs formal review.",
        "bullets": [
          "Contact the responsible IRB, ethics committee, or Human Research Protection Program before accessing or collecting research data. A retrospective design is not an automatic exemption.",
          "Possible institutional determinations include not-human-subject research, exempt research, expedited review, or full-board review. Keep the written determination with the project records.",
          "Protect consent, confidentiality, and local legal requirements. Do not move identifiable information into personal email, messaging apps, consumer cloud drives, or an unencrypted laptop unless institutional policy explicitly permits it.",
          "Clinical trials may carry registration and results-reporting duties. Use the responsible institution and current ClinicalTrials.gov guidance to determine what applies.",
          "Prospective registration is also good discipline for eligible systematic reviews because it fixes the planned question and methods before results can influence them."
        ],
        "links": [
          {
            "label": "OHRP resources for investigators",
            "url": "https://www.hhs.gov/ohrp/education-and-outreach/human-research-protection-program-fundamentals/resources-for-investigators/index.html"
          },
          {
            "label": "ClinicalTrials.gov registration FAQs",
            "url": "https://clinicaltrials.gov/policy/faq"
          }
        ]
      },
      {
        "number": 11,
        "title": "Build clean data before running a test",
        "introduction": "A tidy dataset is not clerical polish; it is part of the scientific method.",
        "bullets": [
          "Create a data dictionary that gives every variable a definition, type, unit, allowed values, source, and missing-value code. Decide which fields can identify a participant and separate them where required.",
          "Use a standardized collection form and controlled naming convention. Record who collected or changed data, when the change occurred, and why.",
          "Plan secure storage, access permissions, backups, version control, and retention. Use institution-approved systems such as REDCap when sensitive clinical information is involved.",
          "Before analysis, check duplicates, impossible values, inconsistent units, date logic, missingness, labels, and outliers. An age of 487 years is a data problem, not a discovery.",
          "Keep raw data read-only. Perform cleaning in a documented copy or reproducible script so another researcher can trace the path from source to analytic dataset."
        ],
        "links": []
      },
      {
        "number": 12,
        "title": "Analyze for meaning, not a magic p-value",
        "introduction": "The statistical method should answer the question and respect the data’s structure.",
        "bullets": [
          "Begin with the cohort flow and descriptive statistics. Counts, percentages, means, medians, spread, and missingness often reveal errors or imbalances before modeling begins.",
          "Choose inferential methods according to the outcome, predictor types, distribution, design, clustering, repeated measures, confounders, and assumptions—not because a test name is familiar.",
          "Report effect sizes and confidence intervals alongside p-values. A small p-value does not prove clinical importance, and a value just above 0.05 does not establish that no meaningful relationship exists.",
          "Distinguish association from causation. Retrospective and observational data remain vulnerable to confounding, selection bias, measurement error, and missing information even when the regression output looks polished.",
          "Do not keep testing variations until one becomes significant. Pre-specify primary analyses, label exploratory work honestly, and preserve code or an analysis log."
        ],
        "links": []
      },
      {
        "number": 13,
        "title": "Write the manuscript as an argument with evidence",
        "introduction": "Most original clinical papers use IMRaD: Introduction, Methods, Results, and Discussion. Each part has a different job.",
        "bullets": [
          "Introduction — establish the clinical problem, summarize what is known, identify the precise gap, and finish with the study objective. Three purposeful paragraphs usually beat a miniature textbook.",
          "Methods — describe design, setting, dates, population, eligibility, variables, outcomes, data source, sample-size reasoning, analyses, and ethics clearly enough for a reader to judge or reproduce the work.",
          "Results — report participant flow, baseline characteristics, primary and secondary findings, effect estimates, confidence intervals, and missing data without turning the section into a discussion.",
          "Discussion — open with the principal finding, compare it with previous work, explain plausible reasons, describe implications, acknowledge strengths and limitations, and close with a balanced conclusion.",
          "Draft tables and figures early. A well-designed table can expose gaps in the analysis and communicate patterns more honestly than a dense paragraph."
        ],
        "links": []
      },
      {
        "number": 14,
        "title": "Use the reporting guideline while the study is young",
        "introduction": "Reporting checklists are design companions, not paperwork to discover on submission night.",
        "bullets": [
          "Use CONSORT for randomized trials, STROBE for observational studies, PRISMA for systematic reviews, CARE for case reports, STARD for diagnostic-accuracy studies, TRIPOD for prediction models, and SQUIRE for quality improvement where each guideline applies.",
          "Protocols may need SPIRIT or PRISMA-P; qualitative studies commonly use COREQ or SRQR. Search the EQUATOR Library for the current guideline and any relevant extension.",
          "Walk through the checklist during protocol development. Missing items often reveal an undefined outcome, incomplete search plan, unclear participant flow, or analysis decision that deserves attention before data collection.",
          "Complete the final checklist carefully and point reviewers to the relevant page or section. Treat it as a compact audit of transparency rather than a box-ticking exercise."
        ],
        "links": [
          {
            "label": "EQUATOR reporting-guideline library",
            "url": "https://www.equator-network.org/library/"
          }
        ]
      },
      {
        "number": 15,
        "title": "Choose a journal without falling for a shortcut",
        "introduction": "The right journal serves the study’s audience and standards; the easiest promise is often the most expensive mistake.",
        "bullets": [
          "Shortlist journals that publish your study design and topic. Compare scope, readership, indexing, reputation, article type, word limits, open-access fees, waiver policy, and realistic editorial timelines.",
          "Read several recent papers from each candidate journal. If your manuscript would look out of place in the table of contents, it is unlikely to survive editorial screening.",
          "Watch for aggressive solicitation, hidden charges, invented impact factors, copied journal names, implausibly fast review, and guaranteed acceptance. Genuine peer review cannot promise the outcome in advance.",
          "Avoid choosing a venue solely because it claims to be ‘indexed.’ Verify the specific database directly and distinguish a journal being discoverable somewhere from formal MEDLINE selection or another recognized index.",
          "Agree on the journal with all authors before submission and read its current author instructions line by line."
        ],
        "links": [
          {
            "label": "ICMJE recommendations for medical journals",
            "url": "https://www.icmje.org/recommendations/"
          }
        ]
      },
      {
        "number": 16,
        "title": "Submit, absorb rejection, and revise professionally",
        "introduction": "Publication is an editorial process, not a single upload followed by acceptance.",
        "bullets": [
          "Prepare the manuscript, title page, abstract, figures, tables, supplements, reporting checklist, author contributions, conflicts, and cover letter exactly as requested. Disclose related or overlapping work.",
          "A desk rejection means the editor did not send the paper for external review, often because of scope, priority, novelty, or a visible methods problem. It is common and should trigger diagnosis, not melodrama.",
          "Major revision is continued consideration. Copy every reviewer comment into a response document, answer each point respectfully, describe the exact change, and identify where it appears.",
          "When you disagree, explain the reasoning and evidence without becoming defensive. If the reviewer exposes a true limitation, say so and improve the manuscript.",
          "Keep status language precise: submitted, under review, revision requested, accepted, in press, and published are different states. Never promote a submitted manuscript to a publication on your CV."
        ],
        "links": []
      },
      {
        "number": 17,
        "title": "Use a twelve-month runway",
        "introduction": "A calendar turns an abstract wish into manageable work and leaves room for the delays built into research.",
        "bullets": [
          "Months 1–2 — choose a niche, learn PubMed and core methods, update a research CV, register an ORCID, identify forty to sixty investigators, and begin tailored outreach.",
          "Months 3–4 — join a supervised project, refine a feasible question, complete the protocol, obtain or submit for required approvals, and begin the search, screening, or data-access workflow.",
          "Months 5–7 — collect or extract data, assess quality or risk of bias, clean the dataset, complete the planned analysis, draft tables, and write the first manuscript version.",
          "Months 8–10 — submit the first project, continue an institutional or collaborative study, prepare an abstract or poster, and respond promptly to peer review.",
          "Months 11–12 — complete the next deliverable, update your CV and scholarly-work records, and rehearse explaining the question, methods, role, findings, limitations, and lesson from every project.",
          "Timelines slip. Protect momentum by defining the next action each week and by keeping more than one stage of work moving without joining so many projects that none receive careful attention."
        ],
        "links": [
          {
            "label": "Register or claim an ORCID iD",
            "url": "https://orcid.org/register"
          }
        ]
      },
      {
        "number": 18,
        "title": "Build a scholarly record you can defend",
        "introduction": "The strongest portfolio tells a coherent story about your questions, your contribution, and the doctor you are becoming.",
        "bullets": [
          "The 2027 MyERAS application calls this area Scholarly Work and allows applicants to identify up to three entries as most meaningful. Choose work that shows growth or direction rather than automatically selecting the most prestigious journal name.",
          "Be ready to explain the research question, design, sample, your exact role, major result, principal limitation, and what you would change. If another team member performed an analysis, understand why it was appropriate.",
          "Avoid publication mills, gift authorship, plagiarism, fabricated data, undisclosed duplicate submission, unauthorized patient-data access, and statistical fishing. A crowded CV cannot repair a credibility problem.",
          "Use AI tools only within institutional and journal policy. Do not upload confidential data or unpublished manuscripts into unapproved systems; verify every output, disclose use when required, and never list an AI system as an author.",
          "Mentorship, recommendation letters, collaborators, specialty insight, and interview material may ultimately matter as much as the citation. The lasting achievement is learning how clinical uncertainty becomes a testable question and accountable evidence."
        ],
        "links": [
          {
            "label": "AAMC: What to know about the 2027 ERAS season",
            "url": "https://students-residents.aamc.org/applying-residencies-eras/what-you-need-know-about-2027-eras-application-season"
          },
          {
            "label": "ICMJE guidance on AI in publishing",
            "url": "https://www.icmje.org/recommendations/browse/artificial-intelligence/"
          }
        ]
      }
    ]
    $sections$::jsonb as sections,
    array[
      $conclusion$Your first research project will probably feel slow. A search strategy takes longer than expected, an approval stalls, a dataset arrives untidy, or a reviewer asks the question you hoped nobody would ask. None of that means you do not belong in research. It means you are learning the work rather than admiring the finished paper.$conclusion$,
      $conclusion$Begin with a question small enough to finish, find people who value careful contribution, and make your work easy to trust. Then repeat the cycle: question, protocol, approval, data, analysis, writing, review, and a better next question. Publication is a milestone; becoming a dependable scientific collaborator is the larger achievement.$conclusion$
    ]::text[] as conclusion,
    jsonb_build_array(
      jsonb_build_object(
        'label', 'AAMC 2027 ERAS season guidance',
        'url', 'https://students-residents.aamc.org/applying-residencies-eras/what-you-need-know-about-2027-eras-application-season'
      ),
      jsonb_build_object(
        'label', 'NRMP Charting Outcomes in the Match: International Medical Graduates 2024',
        'url', 'https://www.nrmp.org/wp-content/uploads/2024/09/Charting_Outcomes_IMG2024.pdf'
      ),
      jsonb_build_object(
        'label', 'PubMed',
        'url', 'https://pubmed.ncbi.nlm.nih.gov/'
      ),
      jsonb_build_object(
        'label', 'NIH RePORTER',
        'url', 'https://reporter.nih.gov/search/REPORTER_HOME.do'
      ),
      jsonb_build_object(
        'label', 'HHS Office for Human Research Protections: investigator resources',
        'url', 'https://www.hhs.gov/ohrp/education-and-outreach/human-research-protection-program-fundamentals/resources-for-investigators/index.html'
      ),
      jsonb_build_object(
        'label', 'ClinicalTrials.gov policy FAQs',
        'url', 'https://clinicaltrials.gov/policy/faq'
      ),
      jsonb_build_object(
        'label', 'EQUATOR Network reporting-guideline library',
        'url', 'https://www.equator-network.org/library/'
      ),
      jsonb_build_object(
        'label', 'ICMJE authorship and contributorship recommendations',
        'url', 'https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html'
      ),
      jsonb_build_object(
        'label', 'ICMJE guidance on artificial intelligence in publishing',
        'url', 'https://www.icmje.org/recommendations/browse/artificial-intelligence/'
      )
    ) as source_links
)
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
)
select
  classifications.slug,
  article.title,
  article.eyebrow,
  article.summary,
  article.summary_points,
  classifications.classification,
  article.resource_section,
  article.preamble,
  article.sections,
  article.conclusion,
  null,
  article.source_links,
  'From Research Beginner to Published Author — editorial source brief',
  null,
  date '2026-09-04',
  true,
  timestamptz '2026-09-04 18:00:00+00'
from classifications
cross join article
on conflict (slug) do update
set
  title = excluded.title,
  eyebrow = excluded.eyebrow,
  summary = excluded.summary,
  summary_points = excluded.summary_points,
  classification = excluded.classification,
  resource_section = excluded.resource_section,
  preamble = excluded.preamble,
  sections = excluded.sections,
  conclusion = excluded.conclusion,
  s3_media = excluded.s3_media,
  source_links = excluded.source_links,
  source_document_name = excluded.source_document_name,
  document_s3_url = excluded.document_s3_url,
  reviewed_at = excluded.reviewed_at,
  published = excluded.published,
  published_at = excluded.published_at,
  updated_at = now();

do $$
declare
  research_article_count integer;
  classification_count integer;
begin
  select count(*), count(distinct classification)
  into research_article_count, classification_count
  from public.resources
  where resource_section = 'Research'
    and title = 'From Research Beginner to Published Author'
    and published;

  if research_article_count <> 4 or classification_count <> 4 then
    raise exception
      'Expected the published research article in all four classifications; found % rows across % classifications',
      research_article_count,
      classification_count;
  end if;
end;
$$;

commit;
