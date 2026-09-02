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
  'internal-medicine-evidence-based-live-interview-analysis',
  'Internal Medicine Mock Interview: Evidence, Accountability, and Program Fit',
  'Live interview analysis',
  'Analyze an Internal Medicine applicant’s answers about international training, U.S. rotations, COVID care, mistakes, strengths, weaknesses, long-term goals, and program fit—then learn how to make the evidence and reflection more precise.',
  array[
    'See how concrete examples make an applicant credible and memorable.',
    'Strengthen “Tell me about yourself,” rotation, COVID, and program-fit answers.',
    'Learn the essential elements of a safe and accountable medical-mistake answer.',
    'Turn three weaknesses into concise evidence of insight and improvement.',
    'Combine lessons from earlier live interviews into a final practice checklist.'
  ],
  'residency-and-matching',
  'Live Interview Analysis',
  array[
    $preamble$This mock interview follows Dr. Sanjay Kumar, a graduate of Dow Medical College who describes growing up in a small village in a desert region, moving to Karachi for medical school, completing internship and two years of Internal Medicine residency training, and pursuing several clinical rotations in Chicago. His answers also draw on COVID-ward work, teaching, cricket, cooking, independence, and a desire to mentor future international medical graduates.$preamble$,
    $preamble$The interview’s central strength is evidence. The candidate frequently supports a quality with an experience instead of relying only on adjectives. The next step is to make each example answer the exact question, clarify his personal action and its result, and connect program claims to verified details. The analysis below paraphrases the exchange and offers illustrative revisions using only information preserved in the transcript.$preamble$,
    $preamble$Several words and institution names in the supplied automated transcript are unclear. This article does not guess at uncertain names or clinical details. Applicants should always confirm proper nouns, patient-care facts, and their exact role against the original recording and their own records before using an answer.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "The interview at a glance: examples create credibility",
      "introduction": "The candidate already practices one of the most valuable interview habits: he often follows a claim with evidence.",
      "bullets": [
        "The strongest material — He can discuss two years of Internal Medicine training, continued clinical work, multiple U.S. rotations, COVID care in Pakistan, teaching to finance medical school, mentoring students, and moving from a village to Karachi and later Chicago.",
        "What the interviewer praises — The candidate does not merely call himself capable or hardworking; he repeatedly introduces examples. This gives the interviewer something concrete to evaluate and remember.",
        "What still limits impact — Some examples describe the setting or another physician more clearly than they show the candidate’s own action, result, and reflection. Evidence is strongest when ownership is visible.",
        "The delivery pattern — Repeated fillers and occasional branching make the flow less polished. Practice should preserve warmth and spontaneity while making the first sentence direct and the final sentence decisive.",
        "The guiding framework — Claim → specific evidence → your action → result or learning → relevance to residency. Not every answer needs every detail, but every example should prove the point it accompanies."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Tell me about yourself: a compelling journey needs a clear destination",
      "introduction": "The answer has a memorable geographic and professional arc, although its many details compete for attention.",
      "bullets": [
        "Candidate’s answer — He describes growing up in a small village, moving to Karachi and gaining independence in a hostel, graduating from Dow Medical College, completing internship and two years of Internal Medicine training, maintaining continuous clinical practice, and undertaking rotations in Chicago. He also mentions his physician father, siblings, cricket, cooking, an unusual connection to camels, and teaching.",
        "What works — The village-to-city-to-U.S. journey communicates adaptability. Prior residency and continuous clinical work demonstrate readiness, while teaching and personal interests make him more than a list of credentials.",
        "What needs focus — Family details, several hobbies, every training stage, and multiple future goals make the answer longer than necessary. The interviewer should not have to infer why these experiences lead to the current Internal Medicine application.",
        "What an interviewer may infer — He is independent, clinically experienced, family-oriented, adaptable, and academically interested. A sharper closing would translate those qualities into the resident he intends to be.",
        "Illustrative revision — “I grew up in a small village in Pakistan and moved to Karachi to attend Dow Medical College, a transition that taught me independence early. After graduation, I completed internship and two years of Internal Medicine residency training and have remained in clinical practice. Over the past four months in Chicago, rotations across hospital and clinic settings have helped me understand U.S. team-based care and confirmed my goal of continuing Internal Medicine training here. Teaching has remained important throughout my journey because it keeps me learning and lets me support others. Outside medicine, I enjoy cricket and cooking, both of which have helped me build community wherever I live.”",
        "Use this route — Origin and formative transition → selected clinical preparation → why you are here now → one professional value → one human detail. Aim for approximately 90 seconds."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "The cooking follow-up: small talk is still part of the interview",
      "introduction": "The interviewer follows a hobby into a relaxed discussion of cooking and Mexican food, demonstrating how personal details can create rapport.",
      "bullets": [
        "Candidate’s answer — He explains that living independently led him to prepare daily meals and that living with a Mexican roommate introduced him to foods such as chicken tacos, quesadillas, and burritos.",
        "What works — The answer is natural and shows independence, curiosity, and connection across cultures. The interviewer learns how the candidate lives rather than hearing another rehearsed professional claim.",
        "What could be stronger — Brief uncertainty about whether he likes Mexican food creates mixed signals after he describes enjoying the shared cooking experience. A simple, gracious clarification would keep the exchange warm.",
        "What an interviewer may infer — The candidate is willing to try new things and can build relationships in a new environment. That impression matters because residents spend years working and learning together.",
        "A useful approach — Answer the actual personal question, add one vivid detail, and return the conversational turn. There is no need to force a hobby into a leadership or resilience lesson.",
        "Cross-interview lesson — Earlier mock interviews show the same principle: a distinctive personal detail can make an applicant memorable, but only when the candidate is comfortable discussing it naturally in follow-up."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "Which rotation did you like most? Make your learning visible",
      "introduction": "The candidate chooses a rotation and explains its breadth, but the attending’s qualities and schedule occupy more space than his own development.",
      "bullets": [
        "Candidate’s answer — He says every rotation was unique, then selects a Swedish Covenant Hospital experience with a nephrologist who taught through different scenarios. He describes rotating six days per week across several hospital settings and seeing both nephrology and general Internal Medicine work.",
        "What works — He makes a decision instead of refusing to choose. The rotation offered varied sites, acuity, and roles, and the teaching relationship clearly mattered to him.",
        "What is missing — The answer lists where the physician worked but does not identify one responsibility, clinical insight, communication lesson, or change in the candidate’s practice.",
        "What an interviewer may infer — He values exposure and supportive teaching, yet the interviewer cannot fully assess what he contributed or retained.",
        "Illustrative revision — “The rotation I valued most was my experience with a nephrologist across several Chicago hospital settings. Moving between nephrology and general Internal Medicine exposed me to different levels of care and showed me how the same physician adapts communication and decision-making across environments. I especially valued that he taught through clinical scenarios rather than only observation. The experience strengthened my interest in broad Internal Medicine training and helped me understand how I learn best: through supervised involvement, questions, and immediate application.”",
        "Use this framework — Choose → name the distinctive exposure → state what you did or learned → explain how it changed your preparation or goals."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "Tell me about working during COVID: move beyond exposure",
      "introduction": "The candidate establishes timing, setting, and willingness to volunteer, but the answer would be more powerful with one responsibility and one durable lesson.",
      "bullets": [
        "Candidate’s answer — He began residency in January 2020, encountered the pandemic in Karachi soon afterward, volunteered for a dedicated COVID ward, cared for many patients, worked in protective equipment, and learned to adapt as clinical practices changed.",
        "What works — Volunteering during an uncertain period suggests service and courage. The chronology is clear, and the need for innovation creates a strong foundation for discussing adaptability.",
        "What needs development — “Amazing experience” can sound celebratory when describing a devastating event. The answer should acknowledge the human difficulty, name his role, and explain one concrete lesson about uncertainty, teamwork, communication, or patient care.",
        "What an interviewer may infer — He has experience in crisis conditions, but the depth of responsibility and reflection remains unclear.",
        "Illustrative revision — “I began Internal Medicine residency shortly before COVID reached Karachi and volunteered when our hospital opened a dedicated ward. Caring for patients while guidance was changing required close teamwork, careful use of protective measures, and humility about uncertainty. The experience was difficult, but it taught me to communicate changes clearly, seek updated guidance, and remain dependable when a team is under pressure. Those habits have continued to shape how I approach unfamiliar clinical situations.”",
        "Patient-centered check — A crisis story should include the people affected and the professional lesson, not present hardship merely as an impressive credential."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "How did you hear about us? and Why our program? are different questions",
      "introduction": "The candidate correctly mentions his sources, then relies on broad claims when asked to prove fit.",
      "bullets": [
        "Candidate’s answers — He says he found the program through ERAS, reviewed its website, and heard recommendations from senior contacts. For fit, he emphasizes a diverse patient population, resident well-being, and robust resident training.",
        "What works — He distinguishes public information from personal recommendations and chooses factors that matter: diversity, training, and well-being. His experience with diverse communities offers a possible personal connection.",
        "What remains generic — Many programs describe themselves with the same terms. The answer does not cite a patient population, training site, curricular structure, mentorship process, resident initiative, or outcome that validates the claims.",
        "What an interviewer may infer — Interest is genuine but not yet program-specific. Repeating the program’s language without evidence can sound like a website summary rather than a decision.",
        "Illustrative structure — “I first learned about the program through ERAS, then explored the website and spoke with senior colleagues. Three features stood out. First, [verified clinical feature] would build on my experience with [relevant background]. Second, [verified educational feature] fits the way I learn through [specific method]. Third, residents described [specific culture or support practice], which matters because [personal reason]. Together, those details make this program a strong fit for my next stage.”",
        "Research rule — Verify every bracketed fact close to interview day. Use official current pages, program presentations, and resident conversations; attribute what you learned instead of turning impressions into facts.",
        "Cross-interview lesson — Program feature → evidence → connection → next-stage value remains the most reliable fit framework across all of the live analyses."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Tell me about a mistake: correction alone is not enough",
      "introduction": "The candidate offers a real clinical mistake, which is valuable, but the preserved answer stops before demonstrating full accountability and prevention.",
      "bullets": [
        "Candidate’s answer — During internship, he failed to send requested testing to the laboratory. He realized the omission after approximately six hours and then sent it, causing a delay.",
        "What works — The example is concrete, clinically relevant, and clearly his error. He does not blame a colleague or offer a disguised success story.",
        "What is missing — The interviewer needs to know how he discovered it, whether he informed a senior and the patient-care team, whether the delay affected care, what immediate corrective steps were taken, and what system now prevents recurrence.",
        "What an interviewer may infer — Without disclosure, impact assessment, and prevention, “I realized and corrected it” can sound like task completion rather than accountability. In a safety question, the response after the error matters more than the error’s drama.",
        "A complete truthful outline — Context and responsibility → exact omission → recognition → immediate disclosure and escalation → correction → patient impact, stated accurately → contributing factor without excuse → specific safeguard → evidence the safeguard works.",
        "Illustrative language, only if true — “When I recognized the delay, I informed my supervising resident and the treating team, confirmed what needed to be sent, and helped expedite the testing. We assessed whether the delay had changed the care plan. Afterward, I adopted a written task list with closed-loop confirmation for pending samples and results.”",
        "Safety rule — Never invent that a patient was unharmed, a supervisor was notified, or a checklist was created. If those actions did not occur, state the real outcome and what you learned you should do differently now."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "What is your greatest strength? Multitasking needs a safety frame",
      "introduction": "The evidence is strong, but “multitasking” can imply divided attention unless it is translated into prioritization and reliability.",
      "bullets": [
        "Candidate’s answer — During medical school, he tutored three medical students to help finance his education while also participating in volunteer service. During residency, he mentored medical students on clinical rotations. He concludes that he juggles several domains well.",
        "What works — The example demonstrates sustained work, financial responsibility, teaching, service, and time management. It is more persuasive than simply claiming to be hardworking.",
        "What needs reframing — Safe clinical work depends on prioritizing, switching attention deliberately, communicating capacity, and closing loops—not attempting several tasks simultaneously. “Multitasking” can accidentally suggest distraction.",
        "What an interviewer may infer — He is industrious and service-oriented. With the right wording, the same example also shows organization, dependable follow-through, and realistic management of competing priorities.",
        "Illustrative revision — “One of my strengths is organizing competing responsibilities without losing follow-through. In medical school, I supported part of my education by tutoring three students while maintaining my studies and volunteer commitments. Later, during residency, I continued mentoring students alongside clinical work. Those experiences taught me to prioritize by urgency, plan ahead, and communicate early when demands conflict—habits I would bring to managing the responsibilities of internship.”",
        "Use this framework — Strength → demanding example → system or behavior that produced the result → relevance to safe resident work."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Three weaknesses: insight requires evidence of change",
      "introduction": "The candidate identifies three plausible limitations, but the first—hesitating to ask for help—requires especially careful evidence because it touches patient safety.",
      "bullets": [
        "Candidate’s answer — He sometimes tries to solve problems alone before seeking help, hesitates to give negative feedback because he fears harming relationships, and historically found it hard to say no to seniors and colleagues. He says experience has helped him improve each pattern.",
        "What works — These are real professional tensions rather than perfectionism disguised as praise. The three issues share a coherent theme: managing interpersonal discomfort while remaining dependable.",
        "What is missing — “I improved” is a conclusion, not proof. Each weakness needs a boundary, practical consequence, corrective behavior, and recent sign of progress. With three requested, the answers must also be concise.",
        "Safety framing for asking for help — Clarify that this referred to non-urgent independent problem-solving and that clinical uncertainty, deterioration, or risk triggers prompt escalation. Give an example of seeking supervision earlier after recognizing the pattern.",
        "Constructive-feedback framing — Describe using timely, behavior-specific feedback, asking permission when appropriate, connecting it to a shared goal, and inviting the other person’s perspective. Avoid labeling feedback itself as “negative.”",
        "Boundary-setting framing — Explain how you now assess urgency and capacity, negotiate deadlines, propose alternatives, and say no early enough to protect existing commitments.",
        "Compact model — “One pattern was ___. I noticed it could ___. I now ___. A recent example of improvement is ___.” Repeat briefly, then close with the shared lesson about communication and reliability.",
        "Cross-interview lesson — A genuine weakness is safer than a hidden compliment when the answer demonstrates self-awareness, corrective action, and ongoing accountability."
      ],
      "links": []
    },
    {
      "number": 10,
      "title": "Where do you see yourself? Unify fellowship, mentorship, and service",
      "introduction": "The candidate’s first response is uncertain, but his follow-up reveals a coherent long-term vision.",
      "bullets": [
        "Candidate’s answers — He wants to be happy and has not fixed every detail, expresses interest in Cardiology or Gastroenterology, wants to become an excellent clinician and mentor, hopes to guide future IMGs through the U.S. journey, and wants to give back to Pakistan through medical service or remote support.",
        "What works — Clinical excellence, teaching, IMG mentorship, and service to a resource-limited home country create a meaningful vision. He appropriately leaves room for exploration before committing to a fellowship.",
        "What weakens the opening — Saying happiness could come through anything makes the professional direction sound incidental. Naming two fellowships without the experiences behind them can also feel less developed than the mentorship and service goals.",
        "What an interviewer may infer — He has ambition and a genuine service orientation, but the clearest version of the vision appears only after a second question.",
        "Illustrative revision — “In 10 years, I hope to be an excellent internist who combines clinical practice with teaching and mentorship. I am interested in exploring Cardiology and Gastroenterology during residency, but I want broad training before making that decision. Regardless of fellowship, I want to mentor future IMGs and build a practical way to support medical education or service in Pakistan. The exact role may evolve, but clinical excellence, teaching, and giving back are the consistent parts of the future I am working toward.”",
        "Use this framework — Future clinical identity → current area of interest with appropriate openness → contribution beyond your own practice → values that remain stable even if the job title changes."
      ],
      "links": []
    },
    {
      "number": 11,
      "title": "Questions for the interviewer: investigate and connect",
      "introduction": "The candidate asks a substantive wellness question, then uses a shared interest in cricket to create a warm closing conversation.",
      "bullets": [
        "Candidate’s first question — He notes that the website answered many questions and asks what the program does to support residents’ physical and mental well-being. The interviewer describes confidential support and recurring social activities.",
        "What works — The question seeks operational evidence rather than asking whether the program “cares” about wellness. It prompts examples that could help an applicant evaluate culture.",
        "How to deepen it — Ask how residents access support during clinical duties, what schedule or workflow changes have resulted from resident feedback, or how the program distinguishes social events from structural approaches to workload and psychological safety.",
        "Candidate’s second question — He references the interviewer’s public interest in cricket and asks what aspect he enjoys. The exchange develops into playing roles, the World Cup, captaincy, street cricket, and shared sports injuries.",
        "What works — Appropriate professional research finds an authentic common interest and produces the interview’s most relaxed rapport. The candidate also has genuine cricket experience, so the conversation is not manufactured.",
        "Boundary rule — Personalize from appropriate public professional information and shared interests, not private details. A rapport question should complement—not replace—questions needed to assess training quality and fit.",
        "Prepare by role — Residents: daily work and culture. Program leaders: curriculum, feedback, and direction. Faculty: teaching and professional work. Keep two adaptable questions in reserve for a hard time limit."
      ],
      "links": []
    },
    {
      "number": 12,
      "title": "Final playbook: lessons reinforced across the live interviews",
      "introduction": "This interview and the earlier analyses point to the same preparation system: select truthful evidence, make your action visible, and practice until the structure survives a real conversation.",
      "bullets": [
        "Start with the answer. The first sentence should respond directly; context comes afterward. This prevents the strongest point from disappearing inside a long introduction.",
        "Use one example well. Give the minimum context, spend most of the time on your action and reasoning, state the result accurately, and finish with reflection or residency relevance.",
        "Build a six-to-eight-story bank for teamwork, conflict, mistake or failure, feedback, leadership, resilience, patient advocacy, communication, and asking for help. Tag each story with the qualities it can truthfully demonstrate.",
        "Practice three lengths: a one-sentence headline, a 60-to-90-second complete answer, and one additional layer for follow-up. Keep two uninterrupted minutes as the outer ceiling.",
        "Translate unfamiliar training. State the setting, your role, supervision, patient population, and level of responsibility so a U.S. interviewer can evaluate experience without guessing equivalence.",
        "Close the loop on safety stories. For mistakes, conflicts, and deteriorating patients, clarify communication, escalation, patient impact, follow-through, and the system you now use.",
        "Research fit with evidence. Build a worksheet containing two verified program features, the source of each fact, a connection to your experience, and why it matters for your next stage.",
        "Record and review delivery. Count filler words, check whether the first sentence answers the question, identify where the proof is complete, and remove everything that follows without adding meaning.",
        "Protect authenticity. Do not invent outcomes, borrow another candidate’s biography, or copy these sample sentences. Preparation should make your own evidence clearer, not manufacture a different applicant.",
        "Invite conversation. Use a clear ending, maintain attentive eye contact, let warmth appear naturally, listen to follow-ups, and respond to the person in front of you rather than racing through a memorized script."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$This mock interview succeeds because the candidate brings evidence. His journey across settings, Internal Medicine training, work during COVID, teaching, mentorship, and U.S. rotations give interviewers multiple reasons to remember him. Strong preparation should preserve those real experiences while making the point of each one easier to see.$conclusion$,
    $conclusion$The highest-stakes revision is the mistake answer: a safe response must show recognition, disclosure, correction, patient-impact assessment, and prevention without inventing a favorable outcome. The same principle applies elsewhere—specific actions and results are more persuasive than general claims of improvement.$conclusion$,
    $conclusion$Across the Live Interview Analysis series, the pattern is consistent. Strong answers are focused, truthful, evidence-based, reflective, and tailored. They answer the question early, respect the interviewer’s time, and leave room for the exchange to become a conversation.$conclusion$
  ],
  null,
  '[]'::jsonb,
  'User-supplied transcript — Internal Medicine mock interview with Dr. Sanjay Kumar',
  null,
  '2026-09-01',
  true,
  '2026-09-01 17:00:00+00'
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
  article_count integer;
  live_analysis_count integer;
begin
  select count(*)
  into article_count
  from public.resources
  where slug = 'internal-medicine-evidence-based-live-interview-analysis'
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

  if article_count <> 1 or live_analysis_count < 5 then
    raise exception
      'Expected the evidence-based Internal Medicine article and at least five live analyses; found % article and % total',
      article_count,
      live_analysis_count;
  end if;
end;
$$;

commit;
