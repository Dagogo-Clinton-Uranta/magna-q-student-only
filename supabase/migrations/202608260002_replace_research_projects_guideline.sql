begin;

delete from public.guidelines
where title = 'How to Carry Out Research Projects That Strengthen a Residency Application'
   or slug in (
     'research-projects-for-residency-step-2-2027',
     'research-projects-for-residency-step-3-2027',
     'research-projects-for-residency-2027'
   );

with article as (
  select
    'How to Begin Research That Can Get You Matched for Residency'::text as title,
    'A video-led route from your first letter to a defensible research profile'::text as eyebrow,
    'Learn the publishing language, evidence pyramid, three-part letter-to-the-editor method, review and statistical methods, journal submission pathway, and ethical research strategy that can strengthen a residency application.'::text as summary,
    array[
      'Use the video’s three-part letter structure: background, new finding and creative local application.',
      'Study the full SIDS letter and the pioglitazone caution example—including how selection bias can distort a warning.',
      'Understand narrative reviews, systematic reviews and meta-analyses through connected clinical stories.',
      'Read the evidence pyramid and core statistical measures like a working research physician.',
      'Learn publishing terminology, journal access models, submission steps and realistic decision timelines.',
      'Build scholarly work you can defend in ERAS and a residency interview.',
      'Understand what 10–15 publications may contribute to an immigration profile—and why they never guarantee a Green Card.'
    ]::text[] as summary_points,
    array[
      $preamble$Research should make you more useful, more curious, more connected and more able to discuss medicine critically. A publication is valuable because of the work and thinking behind it—not because it is another line on a CV. The practical goal is to enter the scientific conversation, learn to recognize bias and produce work you can defend when a residency interviewer asks what you actually did.$preamble$,
      $preamble$This article follows the sequence, emphasis and teaching examples in the supplied masterclass-based PDF. It gives special attention to letters to the editor, the pioglitazone warning, the complete reconstructed sudden infant death syndrome letter, the evidence pyramid, narrative and systematic reviews, meta-analysis, statistics, journal selection and publication. Current AAMC, publishing and USCIS guidance is added where a video-era simplification needs context.$preamble$,
      $preamble$Educational and legal caution: journal policies, access models, indexing, ERAS classifications and immigration standards change. Verify current author instructions and official AAMC and USCIS guidance, and obtain advice from a research mentor, institutional review body or qualified U.S. immigration attorney when appropriate.$preamble$
    ]::text[] as preamble,
    $sections$
    [
      {
        "number": 1,
        "title": "Why research can strengthen a residency application",
        "introduction": "The video begins with a useful question: beyond passing examinations, what have you done that demonstrates how you think, contribute and grow?",
        "bullets": [
          "Match competitiveness — Research can strengthen an academic profile, support applications to research-intensive or competitive specialties and give students and IMGs evidence of sustained work beyond examinations.",
          "Interview depth — A project you truly understand changes the interview from a memorized performance into a conversation about a subject on which you have made decisions, encountered uncertainty and learned from criticism.",
          "Academic growth — Research teaches literature searching, critical appraisal, data analysis, statistics, scientific writing, teamwork and the discipline of separating what the data show from what you hope they show.",
          "Networking — Reliable work can connect you with mentors, collaborators, conferences, presentations, future projects and people capable of writing detailed letters about your contribution.",
          "Career development — Publications may support fellowship, grant, academic appointment, research-employment and selected employment-based immigration pathways when they form part of a larger record of impact.",
          "For the 2027 MyERAS application, the former Publications section is called Scholarly Work. Applicants can group related outputs into Scholarly Collections and mark up to three works as Most Meaningful.",
          "A publication count is never the complete story. One coherent project that you can explain may be more persuasive than many disconnected entries whose methods, findings and limitations you do not understand."
        ],
        "links": [
          {
            "label": "AAMC — 2027 MyERAS Scholarly Work",
            "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/scholarly-work"
          }
        ]
      },
      {
        "number": 2,
        "title": "Learn the language of journals and publishing",
        "introduction": "These are not decorative academic terms. They determine where you search, what you submit, how readers gain access and what you may accurately claim.",
        "bullets": [
          "Research publication — A published form of research findings, analysis or scholarly argument that other people can access, read, critique and cite.",
          "Journal — A periodical collection of scholarly publications, usually organized around a medical specialty, scientific discipline or professional audience.",
          "Manuscript — The author’s submitted version of an article before the journal has completed editorial assessment, peer review and production.",
          "Reference — A source listed to support a factual statement, method, finding or argument.",
          "Citation — A mention of one published work in another. Citation counts can indicate influence, but expectations differ dramatically by field, article age and publication type.",
          "Journal Impact Factor — A journal-level Clarivate metric based on citations in a given year to scholarly items from the prior two years divided by the number of scholarly items published in those years. It is not a quality score for one article or one researcher.",
          "Open-access journal — A journal whose final articles are freely readable online under an open-access policy. Some charge an article processing charge and some do not.",
          "Subscription or ‘closed-access’ journal — A journal where some or most content is available through a subscription or paywall. Many established journals are hybrid: subscription by default, with an optional paid open-access route.",
          "Database — A searchable research index or repository. PubMed is a biomedical search database; PubMed Central is a free full-text archive; Google Scholar is a broad scholarly search engine.",
          "Peer review — Critical evaluation of a manuscript by experts before publication. It improves scrutiny but does not guarantee that a paper is correct.",
          "DOI — A persistent digital identifier intended to continue resolving to a scholarly work even if its webpage changes.",
          "PMID — The unique identifier attached to a record in PubMed.",
          "Indexing — Inclusion of a journal or article in a recognized database such as MEDLINE/PubMed, Scopus or Web of Science. Verify claims in the database itself.",
          "APC — Article Processing Charge, a fee that some open-access or hybrid journals charge, commonly after acceptance. A fee alone does not prove a journal is predatory.",
          "Predatory or pseudo-journal — An operation that presents itself as scholarly but provides little or no genuine editorial and peer-review control, often while aggressively collecting fees. Warning signs include guaranteed acceptance, hidden charges, fake metrics and unverifiable indexing."
        ],
        "links": [
          {
            "label": "Clarivate — Journal Impact Factor definition",
            "url": "https://webofscience.help.clarivate.com/en-us/Content/wos-core-collection/wos-full-record.htm"
          },
          {
            "label": "ICMJE — predatory journals and peer review",
            "url": "https://icmje.org/recommendations/browse/roles-and-responsibilities/responsibilities-in-the-submission-and-peer-peview-process.html"
          }
        ]
      },
      {
        "number": 3,
        "title": "Read the medical evidence pyramid without worshipping it",
        "introduction": "The classic hierarchy moves from less controlled observation toward designs that can reduce bias or synthesize multiple studies, but the clinical question still determines the right method.",
        "bullets": [
          "The video’s evidence pyramid, from lower to higher, is: expert opinion → case report → case-control study → cohort study → randomized controlled trial → systematic review → meta-analysis.",
          "Expert opinion may be insightful but can be persuasive and wrong. A case report can reveal a new disease or adverse effect but cannot estimate how common it is.",
          "A case-control study starts with an outcome and looks backward for exposures; it is efficient for rare outcomes but vulnerable to selection and recall bias.",
          "A cohort study follows exposed and comparison groups or reconstructs them from records; it can estimate incidence and temporal association but remains vulnerable to confounding.",
          "A randomized controlled trial assigns an intervention and can balance known and unknown confounders, but may be unethical, impractical, underpowered for rare harms or poorly generalizable.",
          "A systematic review uses explicit, reproducible methods to identify and appraise eligible evidence. A meta-analysis statistically pools sufficiently comparable results and is often conducted within a systematic review.",
          "A badly executed meta-analysis can be less trustworthy than a meticulous cohort study. Pooling biased, incompatible studies produces a more precise-looking answer, not necessarily a truer one.",
          "For rare harms, diagnosis, prognosis, prevalence and patient experience, an RCT may not be the ideal or possible design. Ask which bias remains and whether the design can answer the stated question."
        ],
        "links": [
          {
            "label": "NCBI Bookshelf — hierarchy of clinical evidence",
            "url": "https://www.ncbi.nlm.nih.gov/books/NBK99035/"
          }
        ]
      },
      {
        "number": 4,
        "title": "Use a letter to the editor as your first door into publishing",
        "introduction": "The video devotes unusual attention to correspondence because it teaches the complete publishing cycle in a short form: reading, appraisal, argument, referencing, submission, editorial judgment and revision.",
        "bullets": [
          "A private message to an author is not automatically a publication. A letter or correspondence item that a journal accepts and publishes is a real, citable publication.",
          "Whether that letter belongs in a particular MyERAS peer-reviewed journal category depends on the journal’s review process and classification. Use the journal’s exact citation and the current AAMC rules.",
          "Reason 1—new discovery: add evidence or an observation that changes how a recently published paper should be interpreted.",
          "Reason 2—suggestion or addition: identify an important population, mechanism, practical implication or body of evidence that the original article did not include.",
          "Reason 3—critique: identify a methodological, statistical, clinical or interpretive weakness and explain why it matters.",
          "The video’s beginner template is roughly 300–500 words, no more than three authors and about five references. Treat this as a teaching model; every journal has its own limits and submission window.",
          "Part 1—Background: briefly establish the disease, drug, intervention or problem and tell the editor why the original topic matters.",
          "Part 2—What is the new finding? Introduce the new study, overlooked evidence, contradictory result or important limitation. This is the scientific heart of the letter.",
          "Part 3—Your creative or expert contribution: explain what the evidence means in practice and apply it to your setting—for example, lack of awareness locally, a prevalent risk factor, a patient-safety implication or a population the authors did not address.",
          "The third part is what turns summary into scholarship. Do not merely repeat the paper; show what clinicians or researchers should think about differently because of the evidence."
        ]
      },
      {
        "number": 5,
        "title": "Study the pioglitazone warning—and the bias inside it",
        "introduction": "The video’s clearest worked letter concerns pioglitazone. Its value is the movement from context to new evidence to local application, followed by the harder question: did the authors select only evidence that supported their warning?",
        "bullets": [
          "Part 1—Background: the letter identifies pioglitazone as an insulin-sensitizing treatment for type 2 diabetes that became popular because it is effective, affordable and usable with other medicines. It acknowledges known harms such as weight gain, edema and congestive heart failure in susceptible patients.",
          "Part 2—New finding: the letter introduces observational evidence suggesting higher bladder-cancer incidence among users. In the example, a later study included 145,806 people with diabetes and reported 121.0 cases per 100,000 person-years among pioglitazone users versus 88.9 among users of other antidiabetic drugs.",
          "That is an absolute difference of about 32.1 cases per 100,000 person-years and a crude rate ratio near 1.36. Those calculations describe the observed data; they do not by themselves prove causation.",
          "A research physician immediately asks how exposure was defined, how long patients were followed, whether the estimate was adjusted and whether age, sex, smoking, diabetes duration, other medicines and surveillance intensity differed between groups.",
          "Part 3—Creative/local application: the letter asks whether a widely used drug should remain so freely prescribed in the authors’ setting, connects the concern to local bladder-cancer burden and reminds clinicians to notice hematuria, painful urination and underlying cardiac disease.",
          "Bias lesson—A cautionary letter becomes a biased open argument if it cherry-picks only supportive studies. Search deliberately for null findings, later meta-analyses, dose-duration analyses and regulatory reassessments.",
          "Confounding lesson—Smoking or another characteristic may be associated with both treatment choice and bladder cancer. Detection bias may occur if one group receives more urinary investigation. Reverse causation and exposure misclassification should also be considered.",
          "The ethical aim is not to win. State the signal, its absolute size and uncertainty; test alternative explanations; acknowledge counter-evidence; and make a proportionate clinical recommendation."
        ]
      },
      {
        "number": 6,
        "title": "Read the complete SIDS letter-to-the-editor model",
        "introduction": "The supplied PDF reconstructs the video’s sudden infant death syndrome example as a complete teaching letter. It is reproduced below in full so you can see the three parts operating as one argument; it is a model to study, not text to submit as your own.",
        "bullets": [
          "Sample Letter to the Editor — Sudden Infant Death Syndrome: A Medical Mystery",
          "Madam,",
          "Sudden infant death syndrome (SIDS) describes the sudden, unexpected death of an apparently healthy infant that remains unexplained after appropriate investigation. The condition most often occurs during early infancy, with the incidence classically peaking between approximately two and four months of age. A number of epidemiologic risk factors have been described, including low birth weight, male sex, socioeconomic disadvantage, and unsafe sleep practices. The association between prone sleeping and SIDS became particularly important because it offered a modifiable risk factor. Public-health campaigns encouraging parents to place infants on their backs to sleep were followed by a substantial reduction in SIDS rates in several countries.",
          "More recent work suggests that the environment around the sleeping infant deserves additional attention. A large population study examining decades of infant-death data reported an association between high ambient temperature and SIDS. This is important because heat is not simply another demographic marker; it is a potentially modifiable exposure. The observation also raises mechanistic questions about thermoregulation, arousal, ventilation, bedding, clothing, and the way caregivers respond to hot weather.",
          "The practical implication may be especially important in regions where extreme heat is common but safe-sleep counseling focuses almost entirely on sleep position. Parents may know that an infant should be placed supine yet remain unaware of overheating, heavy wrapping, poorly ventilated rooms, or unsafe sleeping environments during very hot weather. Pediatricians and public-health authorities should consider whether local safe-sleep education adequately addresses temperature, clothing, room ventilation, and heat exposure alongside established advice on supine sleep, smoke exposure, and safe bedding. Further locally generated research would help determine whether the association seen internationally is reproduced in hotter climates and whether targeted education can reduce risk.",
          "Structure check—The first paragraph provides background; the second introduces the new finding; the third contributes the author’s creative local application. The final paragraph does not merely demand action: it identifies a knowledge gap and proposes locally generated research."
        ]
      },
      {
        "number": 7,
        "title": "Write and submit your own letter step by step",
        "introduction": "A disciplined short letter is more difficult—and more educational—than a long collection of loosely connected facts.",
        "bullets": [
          "Choose a recent paper in a journal that publishes letters or correspondence. Many journals impose a short time window after the original article appears.",
          "Read beyond the abstract: methods, tables, figures, supplementary material, limitations, disclosures and related editorials.",
          "Write one sentence stating your contribution. If you cannot, your letter probably contains more than one argument.",
          "Search both supporting and opposing evidence using PubMed, related-article tools, references and forward citation chasing.",
          "Draft the three parts in order: background; what is newly found, missed or disputed; and your expert interpretation or local application.",
          "Cut aggressively. A concise letter improves when every sentence advances context, evidence or implication.",
          "Check the journal’s word limit, reference count, author limit, figure policy, submission window, declaration requirements and whether the original authors receive a right of reply.",
          "Ask a mentor to attack the argument, statistics and fairness. Find the bias before an editor or author does.",
          "Submit accurate authorship, funding, conflict-of-interest and AI-use disclosures. Everyone listed must meet the journal’s authorship requirements.",
          "Expect rejection and revise professionally. A rejected letter has still trained you in critical appraisal and concise scientific writing; it may also reveal how to build a stronger next project."
        ],
        "links": [
          {
            "label": "ICMJE — authorship and contributor responsibilities",
            "url": "https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html"
          }
        ]
      },
      {
        "number": 8,
        "title": "Progress from narrative review to systematic review and meta-analysis",
        "introduction": "These formats are related, but they answer different questions and make different promises about how evidence was selected and synthesized.",
        "bullets": [
          "Narrative review—A clinically informed, usually qualitative account of a broad topic. Authors may select literature to build an expert narrative, which is useful for explanation but more vulnerable to selection bias.",
          "Story example—A pediatric resident fascinated by SIDS reads about sleep position, maternal smoking, thermoregulation, serotonin signaling, breastfeeding, prematurity and socioeconomic conditions. The narrative review explains how thinking about SIDS evolved without claiming that every eligible study was found.",
          "Systematic review—A protocol-driven synthesis that attempts to identify all studies meeting explicit criteria for a focused question. It records databases, search strings, dates, screening, extraction and risk-of-bias assessment so another team could reproduce it.",
          "Story example—The resident narrows the question: among infants younger than one year, is higher ambient temperature associated with increased risk of sudden unexpected infant death? Two reviewers independently screen results from prespecified databases and resolve disagreements using a defined process.",
          "Meta-analysis—A statistical method used to combine numerical estimates from sufficiently comparable studies. It may be one component of a systematic review; systematic does not mean ‘qualitative only.’",
          "Story example—Eight eligible studies report adjusted effects comparing high temperature with a reference range. The team extracts effect estimates and confidence intervals, prespecifies the pooling model and uses a forest plot to show the combined magnitude, precision and consistency.",
          "Experienced interpretation—Before trusting the pooled number, compare populations, exposure definitions, outcome definitions, adjustment sets and risk of bias. Statistical heterogeneity is not the only kind of heterogeneity.",
          "Do not call a paper systematic merely because it searched PubMed. The promise lies in an explicit protocol, comprehensive reproducible search, transparent selection and structured appraisal."
        ],
        "links": [
          {
            "label": "ICMJE — manuscript formats and reporting guidelines",
            "url": "https://www.icmje.org/recommendations/browse/manuscript-preparation/preparing-for-submission.html"
          },
          {
            "label": "Cochrane Library — evidence synthesis",
            "url": "https://www.cochranelibrary.com/"
          }
        ]
      },
      {
        "number": 9,
        "title": "Use statistics to measure effect and uncertainty",
        "introduction": "Statistics is not decoration added after data collection. It is part of the design and the language used to separate an observed pattern from a defensible conclusion.",
        "bullets": [
          "Effect size—How large a difference or association is. Clinical importance depends more on magnitude, outcome and context than on whether p is below 0.05.",
          "95% confidence interval—A range expressing uncertainty around an estimate under the model. A wide interval signals low precision; an interval can include both clinically important benefit and harm.",
          "p-value—A probability calculated under a null hypothesis and model assumptions. It is not the probability that the hypothesis is true and does not measure clinical importance.",
          "Relative risk—Risk in the exposed or intervention group divided by risk in the comparison group. Always pair relative language with absolute risk when possible.",
          "Odds ratio—A ratio of odds, common in case-control studies and logistic regression. When outcomes are common, readers may mistakenly interpret it as a risk ratio.",
          "Hazard ratio—A relative time-to-event measure from survival analysis. Its interpretation depends on model assumptions, including proportional hazards when that model is used.",
          "Confounding—A third factor relates to both exposure and outcome and distorts the apparent relationship. Statistical adjustment helps only for variables measured and modeled adequately.",
          "Heterogeneity—Variation among studies. Clinical and methodological differences matter alongside statistical measures such as I².",
          "Forest plot—A display of study-specific effect estimates and confidence intervals, plus a pooled estimate when pooling is justified.",
          "Pioglitazone story—The crude rates of 121.0 versus 88.9 per 100,000 person-years prompt calculation, not conclusion. Ask for the adjusted ratio, confidence interval, event count, covariates, dose-duration relationship and replication.",
          "SIDS story—If eight temperature studies use different definitions of heat, sleep-related death and adjustment for season or socioeconomic conditions, a neat pooled diamond may conceal incompatible questions.",
          "Plan the analysis before examining which approach gives the desired result. Label exploratory work honestly and keep code and decision logs so another analyst can reproduce the result."
        ]
      },
      {
        "number": 10,
        "title": "Understand submission, peer review and publication timing",
        "introduction": "The pathway in the video is straightforward—conduct research → write findings → submit → editorial review → peer review → accept, revise or reject—but each arrow contains real work.",
        "bullets": [
          "Before submission, choose a journal whose aims, readership and article type fit the manuscript. Format the text, figures, references, reporting checklist, ethics statement, authorship, funding and conflicts exactly as instructed.",
          "Prepare the journal portal information and cover letter. Disclose related or prior reports, confirm author approval and contributions, identify the corresponding author and obtain permissions for reused or identifiable material.",
          "Journal preparation often takes one day to several weeks, depending on reformatting, figures, declarations and reporting checklists.",
          "Editorial screening commonly takes a few days to two or three weeks. The editor may desk-reject for scope, novelty, ethics, quality or limited priority without external review.",
          "External peer review often takes two to eight weeks or longer. Reviewers assess the methods, statistics, interpretation, relevance and presentation; journals are not required to send every manuscript for review.",
          "A first decision commonly arrives three to twelve or more weeks after submission. It may be reject, revise or occasionally accept.",
          "Author revision may take one to eight weeks. Respond point by point, quote each concern, show the change and explain evidence-based disagreements without becoming defensive.",
          "Second review and final decision may take days to several weeks. Acceptance is followed by copyediting, proofs, DOI assignment and online-first publication, often over several days to four or more weeks.",
          "There is no universal timeline. A correspondence letter may move in weeks; an original clinical study can take months and multiple journals. Guaranteed publication in 48 hours without meaningful review is a warning sign.",
          "Why publish—New discovery: place a finding into the permanent scientific record.",
          "Why publish—Suggestion or addition: improve how a field interprets or applies existing evidence.",
          "Why publish—Critique: correct weak methods, incomplete interpretations or unsafe conclusions.",
          "Why publish—Residency: demonstrate scholarly activity, critical thinking, specialty commitment and follow-through.",
          "Why publish—Academic reputation: create work that others can cite, test and build upon.",
          "Why publish—Networking: collaborations can lead to mentors, meetings, presentations, future projects and stronger professional letters.",
          "Why publish—Career development: scholarly work can support grants, fellowships, academic appointments and research jobs.",
          "Why publish—Immigration evidence: authorship and demonstrable impact may support some employment-based petitions, but no publication count by itself creates eligibility."
        ],
        "links": [
          {
            "label": "ICMJE — sending a manuscript to a journal",
            "url": "https://icmje.org/recommendations/browse/manuscript-preparation/sending-the-submission.html"
          }
        ]
      },
      {
        "number": 11,
        "title": "Explore established open-access journals",
        "introduction": "The following examples from the supplied guide are fully or predominantly open access. Access models and charges can change, so verify the journal’s current policy, scope, indexing and author instructions before submission.",
        "bullets": [
          "Broad and high-impact medicine/science — PLOS Medicine; PLOS ONE; BMC Medicine; BMJ Open; JAMA Network Open; Nature Communications; Scientific Reports; eLife; eClinicalMedicine.",
          "Public health and health services — BMC Public Health; BMC Health Services Research; Frontiers in Public Health; PLOS Global Public Health; The Lancet Global Health; The Lancet Regional Health — Americas; The Lancet Regional Health — Europe.",
          "Medical education and digital health — BMC Medical Education; Journal of Medical Internet Research (JMIR).",
          "General platforms and multidisciplinary options — Frontiers in Medicine; PeerJ; F1000Research; Wellcome Open Research; Heliyon; SAGE Open Medicine.",
          "Case reports and surgery — Oxford Medical Case Reports; Journal of Surgical Case Reports; International Journal of Surgery Case Reports; Annals of Medicine and Surgery; Cureus.",
          "Microbiology and systems science — mSystems.",
          "Use the Directory of Open Access Journals to discover and verify peer-reviewed open-access titles, but still review the individual journal’s policies and reputation in your specialty.",
          "Open access does not mean low quality, and an APC does not automatically mean predatory. Look for transparent peer review, editors with verifiable affiliations, clear fees and licensing, recognized indexing, preservation and correction policies.",
          "Do not use Impact Factor alone to judge a journal or researcher. Compare journals within the appropriate field and assess the actual paper’s methods and relevance."
        ],
        "links": [
          {
            "label": "DOAJ — find open-access journals",
            "url": "https://doaj.org/"
          },
          {
            "label": "DOAJ — open-access and quality criteria",
            "url": "https://doaj.org/apply/guide/"
          }
        ]
      },
      {
        "number": 12,
        "title": "Explore subscription and hybrid journals",
        "introduction": "‘Closed access’ is often an oversimplification. Many major journals are subscription or hybrid titles where some articles are paywalled and authors may have an open-access option.",
        "bullets": [
          "General medicine — The New England Journal of Medicine (NEJM); JAMA; The Lancet; The BMJ; Annals of Internal Medicine.",
          "Cardiology and vascular medicine — Circulation; Journal of the American College of Cardiology (JACC); Stroke; Circulation Research.",
          "Gastroenterology and hepatology — Gastroenterology; Hepatology; Journal of Hepatology.",
          "Hematology, oncology and infectious disease — Blood; Journal of Clinical Oncology; Clinical Infectious Diseases.",
          "Neurology, radiology and anesthesiology — Neurology; Radiology; Anesthesiology.",
          "Pediatrics, obstetrics and psychiatry — Pediatrics; The Journal of Pediatrics; Obstetrics & Gynecology; American Journal of Psychiatry.",
          "Pulmonary and critical care — CHEST; American Journal of Respiratory and Critical Care Medicine.",
          "Nephrology, urology and surgery — Kidney International; The Journal of Urology; European Urology; Neurosurgery; The Journal of Thoracic and Cardiovascular Surgery; Surgery; British Journal of Surgery.",
          "Orthopedics, plastics and ophthalmology — The Journal of Bone and Joint Surgery; Plastic and Reconstructive Surgery; Ophthalmology.",
          "Endocrinology — Diabetes Care.",
          "Do not submit because a title is famous. Read recent articles, confirm that the journal accepts your manuscript type and question whether its audience is the audience that should act on your finding.",
          "Before submission, verify the current access route, APC or page charges, waiver policy, indexing, median decision time, preprint rules, data-sharing expectations and correspondence limits.",
          "A prestigious mismatch usually ends in a quick desk rejection. A legitimate specialty journal with the correct readership may create more useful discussion and citations."
        ]
      },
      {
        "number": 13,
        "title": "Find papers, ideas, mentors and research teams",
        "introduction": "Open discovery tools can help you learn a field and locate active investigators; controlled clinical data usually requires formal institutional access and supervision.",
        "bullets": [
          "PubMed — Search biomedical literature, MeSH terms, related articles, recent authors and specialty topics.",
          "PubMed Central — Read free full-text biomedical articles archived by the U.S. National Library of Medicine.",
          "Google Scholar — Search broadly, chase citations and locate alternate article versions while verifying the final source.",
          "Europe PMC — Discover articles, preprints, grants, protocols, linked data and active authors.",
          "ClinicalTrials.gov — Find registered and recruiting studies, investigators, institutions, interventions and contact information.",
          "Cochrane Library — Study high-quality systematic reviews and identify questions where evidence remains uncertain.",
          "OpenAlex — Map authors, institutions, citations, topics, funders and research networks.",
          "Open Science Framework — Find protocols, preregistrations, data and collaborative open-science projects.",
          "medRxiv and bioRxiv — Follow emerging preprints while remembering that a preprint may not have been peer reviewed.",
          "For hospital laboratories, university departments, trial teams and private registries, identify a productive investigator, read two or three recent papers and offer a specific contribution such as literature screening, authorized chart abstraction, cleaning, statistics, figures, references or drafting.",
          "Never write, ‘Can you add me to a publication?’ Write, in substance, ‘I understand what your group studies; here is the concrete work I can perform reliably to move the project forward.’",
          "Clarify ethics approval, data permissions, training, supervision, authorship expectations, deliverables and deadlines before touching data. Authorship is credit plus accountability, not payment for a CV line."
        ],
        "links": [
          {
            "label": "PubMed",
            "url": "https://pubmed.ncbi.nlm.nih.gov/"
          },
          {
            "label": "PubMed Central",
            "url": "https://pmc.ncbi.nlm.nih.gov/"
          },
          {
            "label": "Europe PMC",
            "url": "https://europepmc.org/"
          },
          {
            "label": "ClinicalTrials.gov",
            "url": "https://clinicaltrials.gov/"
          },
          {
            "label": "OpenAlex",
            "url": "https://openalex.org/"
          },
          {
            "label": "Open Science Framework",
            "url": "https://osf.io/"
          }
        ]
      },
      {
        "number": 14,
        "title": "Understand what 10–15 publications can mean for a Green Card",
        "introduction": "The video presents roughly 10–15 publications as a point at which a researcher may begin exploring employment-based immigration options. Treat that as a career heuristic, never as a USCIS eligibility rule or promise.",
        "bullets": [
          "There is no USCIS rule that 10, 15, 20 or any other number of publications automatically qualifies a physician or researcher for permanent residence.",
          "A person may file or be the beneficiary of an employment-based immigrant petition only through a legal category whose requirements they can document. The correct category, petition strategy and timing require individualized assessment.",
          "EB-1A extraordinary ability — Authorship of scholarly articles is one regulatory evidence category. Without a qualifying one-time major award, a petitioner generally must meet at least three listed evidentiary criteria.",
          "Meeting three EB-1A criteria is not the end. USCIS evaluates the record in a final-merits determination to decide whether the person has sustained national or international acclaim and is among the small percentage at the top of the field.",
          "For researchers, USCIS may consider citations relative to the field, original contributions of major significance, peer-review work, awards, important roles, media coverage, journal stature and expert evidence—not simply a paper count.",
          "EB-2 National Interest Waiver — The proposed endeavor must have substantial merit and national importance; the person must be well positioned to advance it; and, on balance, waiving the job offer and labor-certification requirement must benefit the United States.",
          "Publications, citations, research impact, grants, presentations, peer review, leadership, clinical expertise and independent letters may support an NIW record, but USCIS sets no fixed publication minimum.",
          "Practical translation of the video — A coherent body of approximately 10–15 legitimate publications, especially with first-author work, citations, peer review, presentations and field influence, may justify asking a qualified U.S. immigration attorney whether EB-1A or EB-2 NIW is realistic.",
          "Do not claim that having 10–15 papers means ‘you qualify’ or ‘you will get a Green Card.’ Quantity can open a professional consultation; the quality, influence, total evidence and legal standard decide the case.",
          "Immigration pathways are separate from residency selection, visa sponsorship and physician-licensing requirements. Obtain legal advice for your facts rather than relying on a video, colleague or publication-count calculator."
        ],
        "links": [
          {
            "label": "USCIS — EB-1 extraordinary ability policy",
            "url": "https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-2"
          },
          {
            "label": "USCIS — EB-2 National Interest Waiver guidance",
            "url": "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250115-Employment-BasedNationalInterestWaivers.pdf"
          }
        ]
      },
      {
        "number": 15,
        "title": "Build a research ladder you can defend at interview",
        "introduction": "A seasoned mentor does not begin by ordering a student to collect 15 papers. The aim is progressive independence, reliable contribution and a recognizable specialty thread.",
        "bullets": [
          "Step 1—Learn to search PubMed properly. Read until abstracts, methods, tables and confidence intervals stop feeling foreign.",
          "Step 2—Write one excellent letter to the editor using background → new finding → creative or local application.",
          "Step 3—Join one real research team and become known as the person who returns clean, documented work on time.",
          "Step 4—Present a poster or oral abstract. Explaining a project to another human exposes gaps that remain invisible on the page.",
          "Step 5—Write a narrative review with mentorship and learn to build an accurate clinical argument without hiding contrary evidence.",
          "Step 6—Progress to a systematic review and learn protocol development, reproducible searching, dual screening, extraction and risk-of-bias assessment.",
          "Step 7—Learn the statistics in your own paper. You need not become a biostatistician, but you must understand why the method was selected and what its output means.",
          "Step 8—Develop a specialty thread. Several connected projects tell a more credible story than unrelated papers assembled only to increase the count.",
          "Step 9—Keep evidence of your contribution, approvals, submissions, presentations, acceptance and citation details. Use accurate MyERAS statuses such as submitted, accepted/in press and published.",
          "Step 10—Let quality compound. One serious mentor and a reputation for reliable work can produce new responsibilities, collaborators, conference introductions and detailed letters.",
          "Interview test 1—What exact clinical or scientific question did the project ask, and why did it matter?",
          "Interview test 2—What design did you use, and what bias was that design unable to remove?",
          "Interview test 3—What exactly did you do rather than what the team did?",
          "Interview test 4—What did you find, including the effect size and uncertainty where relevant?",
          "Interview test 5—What is the largest limitation or most credible alternative explanation?",
          "Interview test 6—What should be studied or done next? If you cannot answer all six without notes, revisit the project before the interview."
        ]
      }
    ]
    $sections$::jsonb as sections,
    array[
      $conclusion$Begin with the letter to the editor because it forces you to practice the habits on which larger projects depend: read closely, state one question, find supporting and opposing evidence, recognize bias, write concisely and tell the reader what the evidence means in practice. Background → new finding → creative local application is a compact apprenticeship in scientific reasoning.$conclusion$,
      $conclusion$Then climb deliberately: narrative review for clinically intelligent synthesis, systematic review for reproducible evidence selection, meta-analysis for justified statistical pooling and original research for questions that require new data. The evidence pyramid is not a status ladder for authors; it is a reminder to match method to question and account honestly for bias.$conclusion$,
      $conclusion$Research can help you Match when it makes your academic story coherent and gives interviewers evidence of curiosity, ownership and follow-through. Ten to fifteen meaningful publications may also justify exploring academic immigration options, but no count guarantees either residency or permanent residence. The durable advantage is work that other people can use—and that you can explain under careful questioning.$conclusion$
    ]::text[] as conclusion,
    $sources$
    [
      {
        "label": "AAMC — 2027 MyERAS Scholarly Work",
        "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/scholarly-work"
      },
      {
        "label": "AAMC — 2027 ERAS season updates",
        "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/eras-season-updates"
      },
      {
        "label": "USCIS — EB-1 extraordinary ability policy",
        "url": "https://www.uscis.gov/policy-manual/volume-6-part-f-chapter-2"
      },
      {
        "label": "USCIS — EB-2 National Interest Waiver guidance",
        "url": "https://www.uscis.gov/sites/default/files/document/policy-manual-updates/20250115-Employment-BasedNationalInterestWaivers.pdf"
      },
      {
        "label": "ICMJE — authorship and contributors",
        "url": "https://www.icmje.org/recommendations/browse/roles-and-responsibilities/defining-the-role-of-authors-and-contributors.html"
      },
      {
        "label": "ICMJE — manuscript submission",
        "url": "https://icmje.org/recommendations/browse/manuscript-preparation/sending-the-submission.html"
      },
      {
        "label": "ICMJE — manuscript preparation and reporting guidelines",
        "url": "https://www.icmje.org/recommendations/browse/manuscript-preparation/preparing-for-submission.html"
      },
      {
        "label": "Clarivate — Journal Impact Factor definition",
        "url": "https://webofscience.help.clarivate.com/en-us/Content/wos-core-collection/wos-full-record.htm"
      },
      {
        "label": "NCBI Bookshelf — hierarchy of clinical evidence",
        "url": "https://www.ncbi.nlm.nih.gov/books/NBK99035/"
      },
      {
        "label": "DOAJ — Directory of Open Access Journals",
        "url": "https://doaj.org/"
      },
      {
        "label": "PubMed",
        "url": "https://pubmed.ncbi.nlm.nih.gov/"
      },
      {
        "label": "PubMed Central",
        "url": "https://pmc.ncbi.nlm.nih.gov/"
      },
      {
        "label": "ClinicalTrials.gov",
        "url": "https://clinicaltrials.gov/"
      },
      {
        "label": "Europe PMC",
        "url": "https://europepmc.org/"
      },
      {
        "label": "Cochrane Library",
        "url": "https://www.cochranelibrary.com/"
      },
      {
        "label": "OpenAlex",
        "url": "https://openalex.org/"
      },
      {
        "label": "Open Science Framework",
        "url": "https://osf.io/"
      }
    ]
    $sources$::jsonb as source_links
), destinations(slug, classification, published_at) as (
  values
    ('research-projects-for-residency-step-2-2027', 'usmle-step-2-ck', '2026-08-26 19:45:00+01'::timestamptz),
    ('research-projects-for-residency-step-3-2027', 'usmle-step-3', '2026-08-26 19:45:00+01'::timestamptz),
    ('research-projects-for-residency-2027', 'residency-and-matching', '2026-08-26 19:45:00+01'::timestamptz)
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
  'how_to_begin_research_that_can_get_you_matched_for_residency.pdf',
  '2026-08-26',
  true,
  destinations.published_at
from article
cross join destinations;

do $$
declare
  old_title_count integer;
  seeded_count integer;
  classification_count integer;
  section_count integer;
  source_document_count integer;
begin
  select count(*)
  into old_title_count
  from public.guidelines
  where title = 'How to Carry Out Research Projects That Strengthen a Residency Application';

  select
    count(*),
    count(distinct classification),
    min(jsonb_array_length(sections)),
    count(*) filter (
      where source_document_name = 'how_to_begin_research_that_can_get_you_matched_for_residency.pdf'
    )
  into seeded_count, classification_count, section_count, source_document_count
  from public.guidelines
  where slug in (
    'research-projects-for-residency-step-2-2027',
    'research-projects-for-residency-step-3-2027',
    'research-projects-for-residency-2027'
  );

  if old_title_count <> 0
    or seeded_count <> 3
    or classification_count <> 3
    or section_count <> 15
    or source_document_count <> 3
  then
    raise exception 'Research article replacement failed: old %, new %, classifications %, sections %, source documents %', old_title_count, seeded_count, classification_count, section_count, source_document_count;
  end if;
end;
$$;

commit;
