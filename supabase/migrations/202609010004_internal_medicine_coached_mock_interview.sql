begin;

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
  'internal-medicine-coached-mock-interview-analysis',
  'Internal Medicine Mock Interview: Before-and-After Coaching Analysis',
  'Live interview analysis',
  'Watch an international medical graduate answer common Internal Medicine residency questions, then study the immediate coaching: what the answer communicated, what was missing, and how to rebuild it with clearer evidence and reflection.',
  array[
    'Compare initial answers with a stronger evidence-based structure.',
    'Learn to turn internship, U.S. clinical experience, research, and adversity into relevant proof.',
    'See why specificity matters in “Why Internal Medicine?” and “Why our program?” answers.',
    'Analyze a weakness answer and an angry-patient story that need safer framing.',
    'Prepare interviewer-specific questions and a reusable behavioral-story bank.'
  ],
  'residency-and-matching',
  'Live Interview Analysis',
  array[
    $preamble$This coached mock interview follows a recent medical graduate from Vadodara, India, who completed internship during the peak of COVID-19, gained United States clinical experience, and is applying to Internal Medicine. Unlike a polished demonstration, the interviewer pauses after each answer to identify what worked, what remained unclear, and how the candidate could prepare a stronger version.$preamble$,
    $preamble$That makes the transcript useful for studying revision. The candidate’s first answer is not treated as a script to copy, and the coach’s suggestions are not universal rules. Each section below separates the original response from the useful teaching principle, adds appropriate cautions, and offers an answer framework that must be filled with the reader’s own truthful experience.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Tell me about yourself: an opening with identity but little professional evidence",
      "introduction": "The candidate begins with place, history, and adversity, but the interviewer still does not know enough about her clinical preparation or direction.",
      "bullets": [
        "Candidate’s answer — She describes growing up in Vadodara, shares a fact about the city’s royal history and the institution connected to her medical school, states that she graduated after an internship during peak COVID-19, and reflects on growing up between a progressive household and a community where she encountered gender-based barriers. She closes with gratitude for the support that helped her persist.",
        "What works — The answer contains memorable personal context, recent graduation, internship experience, adversity, persistence, and gratitude. It sounds human and gives the interviewer potential questions about her city, training, COVID-era work, and path into medicine.",
        "What is missing — The response does not explain why she is pursuing Internal Medicine, what she did clinically, which U.S. experiences confirmed her plan, what research or achievements matter, or what she hopes to contribute as a resident.",
        "Why wording needs judgment — Saying “I was confused” can obscure the growth she means to describe. A clearer version can name the tension, decision, and action. The coach recommends avoiding the word “sexist”; that is not an absolute rule. Applicants may truthfully discuss gender bias, but the answer should remain specific, professional, and centered on what they did and learned rather than on condemning an entire community.",
        "A stronger outline — Begin with Vadodara and recent graduation, give one sentence about the internship and clinical responsibility, explain how Internal Medicine and U.S. clinical experience shaped the current goal, choose one distinctive achievement or research interest, and end with a brief personal detail or forward-looking statement.",
        "Use this framework — Identity and origin → selected training → specialty direction → evidence of readiness → one human detail. Keep the answer to roughly one to one-and-a-half minutes unless the interviewer invites more."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Why Internal Medicine? Turn themes into evidence",
      "introduction": "The initial answer names the right themes but needs one concrete experience to make each theme credible.",
      "bullets": [
        "Candidate’s answer — During internship, she admired how her mentor and residents worked, encountered varied pathology, valued Internal Medicine’s interdisciplinary and holistic nature, spent time in the COVID unit and intensive care setting, enjoyed collaboration with nurses, other health professionals, and specialties, and valued following patients from illness toward improvement.",
        "What works — Three genuine motivations emerge: diverse clinical problems, interdisciplinary teamwork, and continuity and connection with patients. Her internship and COVID experience can support all three.",
        "What is missing — The answer moves between themes without developing them. “I was fascinated” and “I loved teamwork” describe emotion, but the interviewer still needs to see what she observed, did, or learned.",
        "How to rebuild it — Select no more than three reasons. For teamwork, briefly show how physicians, nurses, consultants, or other professionals combined information into a plan. For breadth, mention the range of systems or acuity she managed without reciting a full case. For continuity, use one de-identified sentence about following a patient and why that relationship mattered.",
        "Why internship context matters for an IMG — A U.S. interviewer may not know the responsibility attached to internship in another country. Naming the setting, patient volume, role, supervision, and decisions turns an unfamiliar credential into understandable clinical evidence.",
        "Use this framework — Clinical experience → aspect of Internal Medicine you valued → brief example → what it revealed about your fit. Repeat for only the strongest two or three themes."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Why our program? Move from categories to proof of fit",
      "introduction": "The candidate organizes the answer well around clinical training, research, and fellowship opportunity, but each reason remains too general.",
      "bullets": [
        "Candidate’s answer — She connects her internship in a high-volume tertiary hospital to the program’s busy clinical setting, describes an early research project involving mucormycosis and seeing how research could help patients, and values the program’s research and future fellowship opportunities while her subspecialty choice remains open.",
        "What works — Clinical fit comes first, and the three themes are easy to follow. She also uses the question to remind the interviewer of patient volume, research exposure, and ambition for further training.",
        "What is missing — “High volume,” “research opportunities,” and “fellowship opportunities” could describe many programs. The research example needs her exact role and lesson, while the program claims need evidence from the website, presentation, residents, faculty, or outcomes.",
        "How to strengthen the clinical reason — Name the patient population, training site, autonomy model, continuity structure, or range of pathology that matches her prior experience and growth needs. High volume alone is not educational quality; explain what the volume allows residents to learn and how supervision supports it.",
        "How to strengthen the research reason — State the question behind the mucormycosis project, her personal contribution, one skill or insight gained, and the specific program infrastructure or mentor that could help her continue.",
        "How to handle fellowship interest — Express a credible direction without pretending certainty. If the program has relevant fellowships or placement, connect them specifically. If it does not, choose a stronger reason such as broad clinical training, community service, mentorship, or the setting instead of forcing a fellowship-centered answer.",
        "Use this framework — Program feature → evidence you researched it → connection to your experience → why it matters to your next stage. Three deep connections are enough."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "What are your strengths? Replace labels with demonstrations",
      "introduction": "The transcript’s original strength response is not fully preserved, but the coaching makes the evaluation standard clear.",
      "bullets": [
        "The coaching identifies teamwork, hard work, determination, clinical experience, research, patient advocacy, and the ability to complete difficult work as possible resident-relevant strengths.",
        "A label is not evidence. Saying “I am a team player” requires an example of coordinating with others, changing your approach after input, supporting a colleague, or helping a team reach a patient-care goal.",
        "Hard work also needs a visible cost or sustained action: balancing employment with medical school, managing heavy clinical responsibility, repeating deliberate practice to achieve a difficult result, or completing a demanding project over time.",
        "Non-medical examples can be strong when the achievement is substantial and the transfer is explicit. Competitive sport, caregiving, community leadership, or another long-term pursuit may demonstrate discipline, teamwork, or resilience more memorably than another clinical adjective.",
        "Do not force every attractive quality into one answer. Choose two or three, show concise evidence, and explain how each will affect the way you work as an intern.",
        "Use this framework — Strength → one concrete example → behavior the example proves → relevance to residency. Tailor emphasis to the program while keeping the underlying facts unchanged."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "What is your weakness? Anxiety without a plan creates uncertainty",
      "introduction": "A credible weakness answer must define the limitation, show its boundaries, and provide observable evidence of improvement.",
      "bullets": [
        "Candidate’s answer — She says she is an anxious person, becomes overwhelmed in some situations, has worked on it personally, and believes she can overcome it, although it remains a weakness.",
        "What works — The answer is candid and does not disguise a compliment as a weakness. It acknowledges ongoing development rather than claiming the issue has vanished.",
        "Why the answer is risky — “Anxious,” “overwhelmed,” and “certain scenarios” are too broad. The interviewer cannot tell what triggers the problem, whether it affects patient care or team function, what she has done, or whether her strategy works.",
        "How to rebuild it — Define the behavior precisely and within an appropriate boundary, explain its practical effect, name the actions used to improve, and give a recent sign of progress. Public-speaking anxiety, for example, can be described through gradual exposure to small-group teaching and increasing audience size if that is truthful.",
        "Editorial caution — The goal is not to hide a health condition or invent a harmless weakness. It is to answer a professional question at the level necessary to demonstrate self-awareness, safe functioning, and growth. Applicants who need care should seek appropriate support rather than treating interview language as treatment.",
        "Use this framework — Specific limitation → consequence → insight → corrective behavior → evidence of progress → what you continue to monitor."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "Difficult patient: asking for help was appropriate, but the story needs your action",
      "introduction": "The candidate’s angry-patient example is clinically plausible, yet it leaves the attending as the only person who resolved the situation.",
      "bullets": [
        "Candidate’s answer — During a U.S. clinical rotation in San Antonio, an older patient had difficulty understanding her accent and became angry. The candidate tried to respond verbally, then called the supervising physician so the interaction would not worsen.",
        "What works — She recognizes escalation, protects the patient encounter, and appropriately involves a supervisor rather than persisting beyond what she can manage as a rotating student. Asking for help is not itself a failure.",
        "What is missing — The answer does not show what she tried, how she checked understanding, whether she acknowledged the patient’s frustration, what the supervisor modeled, how the patient’s care concluded, or what she changed in later encounters.",
        "A safer analysis than “you did nothing” — Escalation can be exactly the right clinical action when communication or safety is deteriorating. The weakness is not seeking help; it is failing to articulate the judgment, communication attempts, patient outcome, and learning that made the escalation responsible.",
        "How a stronger story might work — Briefly establish the rotation and barrier, describe listening and validation, slowing speech or using plain language, checking comprehension, seeking appropriate language or supervisory support, and ensuring the patient’s concern and medical need were addressed. Include only actions that truly occurred.",
        "Use this framework — Context → barrier → your communication and safety actions → help or resources used → patient outcome → what you now do differently. Spend most of the answer on action and reflection, not on why the patient was angry."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Do you have questions for me? Match the question to the person",
      "introduction": "The candidate prepares a reasonable question, but it is better directed to residents than to program leadership.",
      "bullets": [
        "Candidate’s answer — She asks what day-to-day life looks like for a first-year resident and initially has no second question prepared.",
        "What works — The question seeks practical information that matters when comparing programs. It can reveal workload, teaching, workflow, and resident experience.",
        "What needs adjustment — A resident can answer daily-life questions with firsthand detail. A program director is better positioned to discuss educational priorities, feedback systems, planned changes, resident development, or what the program seeks in applicants.",
        "Prepare more questions than you expect to ask — A typical conversation may leave time for one or two, while another interviewer may begin by asking what you want to know. A reserve list prevents panic and lets you respond to the actual time available.",
        "Build on known information — Do not ask for a fact stated on the website or repeated in the presentation. Use it as the premise for a deeper question: if fellowship outcomes are listed, ask what mentorship or experiences helped residents achieve them.",
        "Use this framework — What can this person uniquely explain? → what do I need to assess fit? → what prior research can I reference? → what follow-up would deepen the answer? Respect the clock and do not force a second question when the next interview should begin."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "Build answers from bullet points, not scripts",
      "introduction": "The recurring coaching method is to decide the message before choosing the wording.",
      "bullets": [
        "For each common question, write the two or three conclusions you want the interviewer to reach. Then attach one truthful example to each conclusion.",
        "Do not memorize full paragraphs. Scripts often create flat delivery, make applicants continue after the question has changed, and consume attention that should be used to listen.",
        "Do rehearse transitions and shorter versions. Preparation should reduce wandering and repetition while preserving the ability to answer a follow-up naturally.",
        "An example can carry several messages at once: “During my internship” establishes clinical experience; collaboration demonstrates teamwork; the decision demonstrates judgment; reflection demonstrates coachability.",
        "Three points are usually enough. More points create a list, lengthen the answer, and make the central message harder to remember.",
        "A useful self-check is to summarize your answer in one sentence after practicing. If you cannot identify its two or three main points, the interviewer probably cannot either."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Make every example do professional work",
      "introduction": "An interesting detail belongs in an interview when it also helps the interviewer understand the applicant’s preparation, values, or way of working.",
      "bullets": [
        "The history of a hometown can be memorable, but connect it to the applicant: community identity, exposure to diverse people, service, curiosity, or another real influence. Otherwise it occupies scarce time without strengthening the professional picture.",
        "U.S. clinical experience should do more than appear as a credential. Explain what you learned about rounds, documentation, communication, team roles, supervision, or patient expectations and how it confirmed or refined your plan.",
        "Research should include the question, your role, and what changed in your thinking or skill. “I enjoyed research” is weaker than describing the contribution and why the process matters to future patients or scholarship.",
        "Adversity should reveal agency. Name the barrier proportionately, show the choice and work it required, and explain the capability or value that emerged. Avoid turning the answer into either a grievance monologue or a triumph stripped of context.",
        "Personal statements and interviews may use the same foundational experience. Do not recite the written paragraph; offer a concise spoken version, a different angle, or a follow-up insight that makes the conversation feel alive."
      ],
      "links": []
    },
    {
      "number": 10,
      "title": "Research the program before you claim fit",
      "introduction": "Program research determines whether an answer sounds intentional or interchangeable.",
      "bullets": [
        "Review the clinical sites, patient populations, curriculum, schedule structure, continuity clinic, teaching, scholarship, mentorship, resident support, and graduate outcomes on current official pages.",
        "If interviewers are announced, review their institutional role and legitimate professional interests. This helps you ask relevant questions; it does not require personal investigation beyond appropriate public professional information.",
        "Use resident conversations, open houses, rotations, and program presentations to understand culture, then attribute the source: “Residents described…” is more credible than “Everyone is supportive.”",
        "Choose reasons that fit the specific program. Fellowship infrastructure may matter at one institution; service to a defined community, broad hands-on training, or close mentorship may be more authentic at another.",
        "Clinical training should remain central because residency is a clinical job. Research, geography, family, fellowship, and culture can strengthen fit, but they should not leave the interviewer wondering whether patient care is secondary.",
        "Never invent a statistic or repeat an outdated feature to sound prepared. Verify details close to interview day and ask when information appears inconsistent."
      ],
      "links": []
    },
    {
      "number": 11,
      "title": "Prepare behavioral stories before the pressure of interview day",
      "introduction": "Behavioral questions are difficult to answer from scratch because the applicant must select a story and organize its meaning at the same time.",
      "bullets": [
        "Create a story bank for teamwork, leadership, conflict, feedback, failure, resilience, an angry or distressed patient, a communication barrier, ethical tension, patient advocacy, and asking for help.",
        "For each story, record the context, challenge, your action, use of supervision or resources, outcome, and lesson. Mark which resident-relevant qualities it demonstrates.",
        "Choose examples that show judgment rather than spectacle. An ordinary disagreement handled well is more useful than a dramatic incident in which your role is unclear.",
        "Keep the problem to roughly one-third of the answer. The majority should show what you did, why you did it, what happened, and what the experience changed.",
        "Seeking help is compatible with ownership. Residents must recognize limits and escalate safely; the answer becomes strong when the applicant explains the assessment, initial action, reason for escalation, and follow-through.",
        "When a patient is involved, preserve confidentiality and close the loop on care. The story should reveal patient-centeredness, not use the patient merely as scenery for a personal lesson."
      ],
      "links": []
    },
    {
      "number": 12,
      "title": "Extra tips: practice the revised interview",
      "introduction": "Revision is complete only when the stronger structure still sounds like the applicant rather than the coach.",
      "bullets": [
        "Rewrite each answer as no more than three bullet points, then say it aloud without reading sentences. Record both a full version and a shorter version.",
        "Ask a reviewer to state what they learned about you after each answer. Compare their impression with the qualities you intended to communicate.",
        "Remove unsupported adjectives. Circle words such as hardworking, collaborative, resilient, passionate, or adaptable and confirm that each has nearby evidence.",
        "Review your CV, personal statement, and ERAS experiences until you can explain the purpose, your role, result, and learning from every entry without exaggeration.",
        "Prepare a program worksheet with verified clinical features, two genuine fit connections, interviewer-specific questions, resident questions, and one concern you still need to investigate.",
        "Practice difficult follow-ups: What exactly did you do? What was the patient outcome? What would your colleague say? How do you know you improved? Why this program rather than another?",
        "Use respectful, precise language for adversity, mental health, patients, and colleagues. Professional framing should clarify the experience, not erase truth or discourage appropriate help-seeking.",
        "Finish by repeating the mock interview without interruptions. The goal is not a flawless script; it is a clear, evidence-based conversation in which your real judgment and personality remain visible."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$The first answers in this mock interview are valuable because their weaknesses are common: an opening that is personal but not professionally informative, specialty reasons without examples, program praise without specificity, a broad weakness without an improvement process, and a behavioral story in which the applicant’s action is unclear.$conclusion$,
    $conclusion$The repair is consistent across questions. Decide what the interviewer should learn, select a truthful experience that proves it, make your action visible, and end with relevance or reflection. For an IMG, explain unfamiliar training and responsibility rather than assuming the institution’s name speaks for itself.$conclusion$,
    $conclusion$Good coaching should help the answer become more authentically yours. It should not supply accomplishments you did not have, hide appropriate uncertainty, or turn every sentence into sales language. Clear evidence, honest limits, patient-centered judgment, and a natural conversation are stronger than a rehearsed performance.$conclusion$
  ],
  null,
  '[]'::jsonb,
  'User-supplied transcript — coached Internal Medicine residency mock interview',
  null,
  '2026-09-01',
  true,
  '2026-09-01 15:00:00+00'
)
on conflict (slug) do update set
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
  coached_article_count integer;
  live_analysis_count integer;
begin
  select count(*)
  into coached_article_count
  from public.resources
  where slug = 'internal-medicine-coached-mock-interview-analysis'
    and classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published
    and jsonb_array_length(sections) = 12;

  select count(*)
  into live_analysis_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published;

  if coached_article_count <> 1 or live_analysis_count < 3 then
    raise exception
      'Expected the coached Internal Medicine article and at least three live analyses; found % coached and % total',
      coached_article_count,
      live_analysis_count;
  end if;
end;
$$;

commit;
