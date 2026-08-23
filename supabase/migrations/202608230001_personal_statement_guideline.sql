begin;

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
  'standout-residency-personal-statement-2027',
  'How to Write a Standout Residency Personal Statement for the 2027 ERAS Season',
  'Turn experience into a memorable application story',
  'Build a focused, authentic residency personal statement that shows your qualities through evidence, explains your specialty fit and gives interviewers a human story worth remembering.',
  array[
    'Define the one-sentence identity you want a reviewer to remember.',
    'Use Sally, Paul and Aisha to see the difference between claims, evidence and excuses.',
    'Turn patient encounters into reflection instead of miniature case reports.',
    'Connect concrete experiences to the work of your chosen specialty.',
    'Learn from Elena, Priya, James and Nora without treating anecdotes as guarantees.',
    'Edit for authenticity, specificity, confidentiality and a coherent final impression.'
  ],
  'residency-and-matching',
  array[
    $preamble$Your CV tells programs what you did. Your personal statement should explain what those experiences mean, why your specialty fits you and what kind of resident and colleague you are likely to become. It should make the structured application understandable as a human story—not repeat the CV in paragraphs.$preamble$,
    $preamble$This guide deliberately keeps the story examples from the supplied 2027 document. Sally, Paul and Aisha are teaching composites; Elena, Priya, James and Nora are anonymized public applicant reports. Those reports are anecdotal and never prove that a statement alone caused an interview outcome. They show how concrete writing can shape what a reviewer remembers and asks about.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Know what the personal statement must accomplish",
      "introduction": "A busy reviewer should finish the statement understanding who you are, why the specialty makes sense, what evidence supports your claimed qualities and what you will contribute.",
      "bullets": [
        "Use the elevator-pitch test: after reading, could a faculty member summarize you in one or two specific sentences? ‘Good student who did research and wants to help people’ is not yet a distinctive identity.",
        "For the 2027 season, applicants may begin submitting MyERAS applications on September 2, 2026 at 9:00 a.m. ET, and programs may begin reviewing them on September 23, 2026 at 9:00 a.m. ET.",
        "The 2027 MyERAS guide permits up to 28,000 characters including spaces and punctuation, but that technical ceiling is not a writing target. Clarity and readability matter more than filling the allowance.",
        "MyERAS permits multiple statements and lets you assign one to each program. Use precise titles for your own assignment control and preview every version in the portal.",
        "AI can help with brainstorming, proofreading or editing, but the submitted statement must remain your own work and voice. Plagiarism may be investigated and substantiated findings reported to programs."
      ],
      "links": [
        {
          "label": "AAMC — 2027 ERAS residency timeline",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
        },
        {
          "label": "AAMC — MyERAS personal statement guidance",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/personal-statement"
        }
      ]
    },
    {
      "number": 2,
      "title": "Start with identity and build a story bank",
      "introduction": "Do not begin by forcing a perfect opening sentence. First decide what the reader should remember and collect the moments that can prove it.",
      "bullets": [
        "Complete this private planning sentence: ‘I am an applicant whose ___ led me toward ___, and I hope to bring ___ to residency.’ It is a compass, not a line to copy into the essay.",
        "Choose only two or three qualities you can prove, such as communication, cultural humility, reliability, resilience, ethical responsibility, teamwork, leadership or self-reflection.",
        "List 8–12 moments from patient care, school, work, research, service, teaching, migration or family life before choosing the opening story.",
        "For each candidate moment, note the situation, challenge, your action, what you learned and how it connects to the physician you want to become.",
        "Cross-check the statement against your MyERAS experiences. It should add meaning and reflection rather than duplicate all ten experience descriptions.",
        "Identity example — An IMG who worked in a resource-limited emergency department might center calm decision-making, safe improvisation and clear cross-team communication, then connect those demonstrated qualities to emergency medicine and service to diverse populations."
      ]
    },
    {
      "number": 3,
      "title": "Show qualities through evidence: Sally and Paul",
      "introduction": "Adjectives are easy to claim. A scene, decision and changed behavior let the reviewer reach the conclusion for themselves.",
      "bullets": [
        "Story example — Paul writes that he is a resilient, hardworking physician who never gives up. The claim is positive but interchangeable with thousands of statements because the reader receives no evidence.",
        "Story example — Sally briefly acknowledges failing an important assessment, then spends most of the paragraph on what she did next: rebuilt her study system, sought structured feedback, met weekly with a mentor and sustained stronger performance on later clinical exams.",
        "Sally never needs to announce ‘I am resilient.’ Her choices reveal recovery, self-reflection, willingness to seek help and durable improvement.",
        "To show compassion, describe the barrier you noticed, the question you asked, what you changed and how the encounter altered your future treatment planning.",
        "To show leadership, describe the team problem, how you organized peers or delegated responsibility and what you learned about leading without relying on authority.",
        "To show specialty commitment, identify the clinical questions, relationships, procedures, uncertainty or work pattern that repeatedly drew you back."
      ]
    },
    {
      "number": 4,
      "title": "Turn a patient encounter into reflection, not an HPI",
      "introduction": "Include only the clinical facts needed to understand the human or professional problem, then move quickly to what you noticed, did, learned and will carry forward.",
      "bullets": [
        "Avoid full presentations, laboratory values, imaging, medication lists and differentials unless a detail is essential to the lesson.",
        "Center your observation, decision, communication or changed thinking—not the team’s diagnosis and treatment alone.",
        "End with how the encounter will affect your practice rather than simply stating that the patient improved.",
        "Protect confidentiality by changing or omitting unnecessary identifying details. The story must demonstrate judgment, not compromise privacy.",
        "Micro-story — Paul says a heart-failure patient taught him compassion and confirmed his passion for Internal Medicine. Sally recalls a patient returning three days after discharge because he could not afford a medication. She first saw a readmission, then recognized a planning failure and began asking whether medically correct plans were realistic after discharge.",
        "Sally’s version is memorable because the event changes her thinking and naturally connects continuity, systems-based care and Internal Medicine. The teaching-composite details should never be copied into a real application."
      ]
    },
    {
      "number": 5,
      "title": "Give every paragraph a clear job",
      "introduction": "A five-part architecture is a reliable scaffold, but the details and voice must remain yours.",
      "bullets": [
        "Paragraph 1: open with a specific moment or observation that introduces the central theme without trying to sound cinematic.",
        "Paragraph 2: interpret the event. Show what you did, what changed and which quality the story demonstrates.",
        "Paragraph 3: connect experience to concrete features of the specialty rather than saying only that you enjoy helping people.",
        "Paragraph 4: add one or two proof points showing readiness and contribution through teaching, research, service, teamwork, quality improvement, advocacy or resilience.",
        "Final paragraph: synthesize the theme, the physician and colleague you want to become and what you seek in training. Avoid a generic thank-you ending.",
        "Real-world story — Elena, a Family Medicine applicant, reported that several directors and interviewers called her statement unusually compelling and wanted to meet the person behind it. The useful lesson is not that drama produces interviews; it is that a specialty-appropriate story can create genuine reviewer curiosity."
      ]
    },
    {
      "number": 6,
      "title": "Explain why the specialty through experience",
      "introduction": "Use the chain: specialty feature → experience proving you value it → skill or direction you want to develop in residency.",
      "bullets": [
        "Internal Medicine: show revisiting a differential as data changed, coordinating chronic conditions or developing longitudinal understanding.",
        "Family Medicine: connect breadth, continuity, prevention, community context and relationships across life stages to how you think and work.",
        "Psychiatry: show attraction to longitudinal narrative, therapeutic alliance, diagnostic nuance and biological plus psychosocial care.",
        "General Surgery: go beyond working with your hands to show decisions under pressure, ownership, perioperative continuity, technical learning and team coordination.",
        "Pediatrics: show age-adapted communication, family partnership, developmental thinking, advocacy and prevention rather than merely saying you love children.",
        "Emergency Medicine: demonstrate rapid prioritization, comfort with uncertainty, teamwork, procedural readiness and communication across a wide acuity range."
      ]
    },
    {
      "number": 7,
      "title": "Use international experience as evidence",
      "introduction": "For IMGs, the central question is still why you will be a strong resident in the specialty—not simply why you want to enter the United States.",
      "bullets": [
        "Use international experience when it proves resourcefulness, cultural humility, communication, adaptability, breadth of pathology, public-health insight or service in limited-resource settings.",
        "Do not diminish a non-U.S. healthcare system to flatter U.S. programs. Explain what it taught you and what you now want to develop.",
        "Use U.S. clinical experience to show adaptation to team roles, handoffs, documentation, interprofessional care or communication—not merely familiarity with ‘the U.S. system.’",
        "Handle sponsorship accurately in program selection and the application. A long visa explanation rarely belongs in the statement unless it is inseparable from your story.",
        "Do not over-explain accent, nationality, age or graduation year. Include context only when it helps the reader understand your path and readiness.",
        "For 2027, ECFMG began distributing ERAS tokens to IMG residency applicants on June 24, 2026; separately verify current certification, pathway, exam and program requirements."
      ],
      "links": [
        {
          "label": "AAMC — 2027 ERAS timeline for IMGs",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline-international-medical-graduates-img"
        }
      ]
    },
    {
      "number": 8,
      "title": "Address weaknesses with ownership: Aisha’s revision",
      "introduction": "When a gap, failure or unmatched cycle is obvious or central, use a concise sequence: fact → ownership → change → evidence.",
      "bullets": [
        "State the issue plainly, avoid blaming other people for everything and keep the setup proportionate.",
        "Explain the concrete change in preparation, behavior, support, judgment or strategy.",
        "Show the sustained evidence that followed: stronger performance, new responsibility, recent clinical work, better references or clearer direction.",
        "Story example — Aisha is an IMG with a long graduation gap and one weak exam result. Her first draft devotes almost half a page to family responsibilities and exam logistics. The reader learns the circumstances but little about the physician she has become.",
        "Story example — In revision, Aisha gives context in two sentences, then describes a structured study plan, recent U.S. clinical experience, stronger references, regular case presentations and a quality-improvement project. She connects those changes to becoming organized, coachable and deliberate about feedback.",
        "The revision does not hide the weakness; it stops the weakness from becoming Aisha’s entire identity. A previous unmatched applicant can use the same principle by focusing on constructive work completed during the intervening year."
      ]
    },
    {
      "number": 9,
      "title": "Replace generic openings with specific change",
      "introduction": "A familiar experience can work when the observation and reflection are unmistakably yours.",
      "bullets": [
        "Usually rewrite openings built on wanting to be a doctor since childhood, medicine as art and science, loving to help people, fascination with the body, dictionary definitions or a dramatic patient quote.",
        "A relative’s illness can be meaningful, but the essay must transition to what you did or learned as a medical trainee.",
        "Test every opening for movement: what did you initially believe, what did the experience reveal and how did your actions or thinking change?",
        "Keep the story grounded. Grand language and invented-sounding dialogue make a reviewer less—not more—connected to the applicant.",
        "Ask whether the opening creates a concrete reason to read the next paragraph and whether it introduces the same identity the rest of the essay proves."
      ]
    },
    {
      "number": 10,
      "title": "Customize selectively and safely: Priya’s approach",
      "introduction": "Multiple MyERAS statements make customization possible, but careless versions create wrong-program and wrong-specialty errors.",
      "bullets": [
        "Create separate specialty statements when dual applying. Never let a psychiatry program receive a conclusion naming Family Medicine.",
        "Customize for a real connection such as a track, population, mentorship area, curriculum, research focus or mission—not by pasting website language.",
        "Use explicit private titles such as ‘IM — Core’ and ‘IM — Program X’ so the correct version is assigned.",
        "Real-world story — Priya, an Otolaryngology applicant, reportedly used one core statement but customized the final five or six lines for seven programs receiving her strongest signals.",
        "Priya said the deeper program review helped during a dense interview schedule. The lesson is broader than the paragraph itself: a few accurate lines can prepare you to discuss fit naturally, while rewriting dozens of versions multiplies assignment risk."
      ]
    },
    {
      "number": 11,
      "title": "Edit in focused passes and choose reviewers deliberately",
      "introduction": "The first draft discovers the story. Later drafts select, prove, reflect and compress without erasing your voice.",
      "bullets": [
        "Identity pass: highlight sentences that reveal something distinctive. Rewrite paragraphs that could belong to 1,000 applicants.",
        "Evidence pass: circle adjectives such as compassionate, resilient or collaborative and find the nearby action that proves each one.",
        "Reflection pass: ask ‘so what?’ after every story. State what changed in your thinking, behavior or future practice.",
        "Specialty and compression passes: replace generic fit statements, repeated ideas, excessive clinical detail and grand language with precise evidence.",
        "Use a small review team: someone in the specialty, an experienced faculty advisor, an editor who knows your voice and, when helpful, an IMG mentor. Repeated feedback patterns matter more than obeying every conflicting suggestion.",
        "Real-world story — James, a surgical applicant, used a core specialty statement with a short program-specific closing and reported that it came up in every interview. He also correctly cautioned that he could not know how much of his outcome came from the essay. The narrow lesson: a targeted statement can create meaningful interview material."
      ]
    },
    {
      "number": 12,
      "title": "Study a complete transformation—and Nora’s reality check",
      "introduction": "The worked Internal Medicine example shows how observation and reflection can replace an interchangeable list of qualities.",
      "bullets": [
        "Worked story — A generic IMG draft says Internal Medicine treats many diseases and calls the applicant hardworking, compassionate and good at complex problems. Nothing in it lets a reviewer verify those qualities.",
        "Worked story — The stronger version follows patients traveling five hours by bus and rationing medications between visits. The applicant stops labeling them ‘noncompliant,’ asks whether a treatment plan is possible and works with the team to simplify regimens and explain follow-up.",
        "That story simultaneously shows observation, clinical reasoning, communication, social context, longitudinal thinking and a specialty-specific reason for Internal Medicine.",
        "Real-world story — Nora’s partner reported that she received 17 General Surgery interviews, including five at highly ranked programs, and that interviewers often discussed her statement.",
        "Nora’s report also supplies the essential caution: her whole application was strong, her CV contributed heavily and readers disagreed about whether the essay itself was exceptional. A statement need not single-handedly win an interview; it should make the application coherent and give interviewers something meaningful to explore."
      ]
    },
    {
      "number": 13,
      "title": "Use the final worksheet and assignment checklist",
      "introduction": "Before submission, make sure the statement has an identity, proof, specialty direction, contribution and technically correct assignment.",
      "bullets": [
        "Write one sentence each for: what the director should remember tomorrow, why the specialty fits how you work, your strongest story, a second proof point, what colleagues and patients gain from you and the physician you hope to become.",
        "Confirm that the first paragraph earns the second, at least one story demonstrates rather than names a quality and every story contains reflection.",
        "Confirm that patient details protect confidentiality and the essay adds meaning beyond the CV and MyERAS experience entries.",
        "Check that any weakness follows ownership, change and evidence, and that customized program and specialty names are correct.",
        "Preview the statement in MyERAS, inspect page layout and verify that every program has the intended version.",
        "Check spelling, grammar, names and terminology one last time. The final wording must remain recognizably yours after all editing help."
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$A standout personal statement is not the one with the most dramatic patient story, ornate vocabulary or longest accomplishment list. It is the one that makes a believable connection between your experiences, values, specialty choice and the resident you are preparing to become.$conclusion$,
    $conclusion$Do not ask, ‘What impressive things can I say about myself?’ Ask, ‘What evidence can I give the reader so they reach the right conclusion about me?’ Sally’s changed behavior, Aisha’s accountable revision and the five-hour-bus encounter are memorable because each story proves a quality and changes the applicant’s thinking.$conclusion$,
    $conclusion$Use the applicant reports as inspiration for clarity and interview-worthy reflection, never as promises of results. Scores, letters, experiences, signaling, school record, fit and interview performance remain part of every program’s holistic decision.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "AAMC — 2027 ERAS residency timeline",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
    },
    {
      "label": "AAMC — 2027 ERAS timeline for IMGs",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline-international-medical-graduates-img"
    },
    {
      "label": "AAMC — MyERAS personal statement guidance",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/personal-statement"
    },
    {
      "label": "AAMC — MyERAS experience guidance",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/experience"
    },
    {
      "label": "Applicant discussion — personal statement advice and Family Medicine report",
      "url": "https://www.reddit.com/r/medicalschool/comments/18nqnjk/"
    },
    {
      "label": "Applicant discussion — selective program customization",
      "url": "https://www.reddit.com/r/medicalschool/comments/12u4yhr/"
    },
    {
      "label": "Applicant discussion — General Surgery personal statement",
      "url": "https://www.reddit.com/r/medicalschool/comments/gz18e6/"
    }
  ]
  $sources$::jsonb,
  'Residency_Personal_Statement_Guide_2027_with_stories.pdf',
  '2026-08-23',
  true,
  '2026-08-23 13:00:00+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
begin
  select count(*), jsonb_array_length(max(sections::text)::jsonb)
  into seeded_count, section_count
  from public.guidelines
  where slug = 'standout-residency-personal-statement-2027';

  if seeded_count <> 1 or section_count <> 13 then
    raise exception 'Expected one published 13-section personal statement guideline, found % article(s) and % section(s)', seeded_count, section_count;
  end if;
end;
$$;

commit;
