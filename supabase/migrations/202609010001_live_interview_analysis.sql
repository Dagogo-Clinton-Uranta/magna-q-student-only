begin;

delete from public.resources
where classification = 'residency-and-matching'
  and (
    slug in (
      'building-a-balanced-residency-program-list',
      'preparing-stories-for-residency-interviews'
    )
    or (
      resource_section = 'Featured resources'
      and source_document_name = 'Temporary visualization seed — safe to delete'
    )
  );

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
  'psychiatry-residency-mock-interview-answer-analysis',
  'Psychiatry Residency Mock Interview: 13 Answers Analyzed',
  'Live interview analysis',
  'Read a psychiatry applicant’s response to thirteen common residency interview questions, then examine what makes each answer effective, what could be stronger, and which structure you can adapt to your own experience.',
  array[
    'See how a strong opening creates a coherent personal and professional narrative.',
    'Learn to connect program research and specialty motivation to your own training goals.',
    'Compare effective strength, weakness, conflict, teamwork, and adversity answers.',
    'Recognize why the integrity and ethics responses require more careful preparation.',
    'Finish with practical delivery, story-bank, and self-recording tips.'
  ],
  'residency-and-matching',
  'Live Interview Analysis',
  array[
    $preamble$This general psychiatry mock interview follows a fourth-year osteopathic medical student through thirteen questions, from “Tell me about yourself” to a difficult ethical decision. After each paraphrased response, the analysis identifies what an interviewer can learn from it, why the structure works, and where a more precise answer would be safer or stronger.$preamble$,
    $preamble$Study the patterns, not the candidate’s personal details. A convincing answer is specific because it is true to your experience; copying someone else’s story, motivation, or language will sound rehearsed and prevent the interviewer from getting to know you. This analysis is educational coaching, not an official AAMC, ACGME, NRMP, or program-director standard.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Tell me about yourself",
      "introduction": "The candidate builds a selective timeline rather than walking line by line through her CV.",
      "bullets": [
        "Candidate’s answer — She introduces her upbringing and Pakistani family background, moves through college and research at academic centers, mentions her concurrent interest in healthcare leadership through an MBA, explains that medical school drew her toward psychiatry, and closes with human details such as outdoor activities, true-crime interests, game nights, and creating educational content.",
        "What works — The answer gives a rounded picture of the person behind the application. Each detail has a purpose and creates a natural follow-up: research, leadership, psychiatry, culture, education, or life outside medicine.",
        "Why the structure works — Background, formative experiences, present direction, and a few personal interests create a story with forward motion. The chronology helps the interviewer follow it, while selectivity keeps it from becoming a CV recital.",
        "What could be stronger — The answer contains many possible threads. If the interviewer appears ready to move on, the candidate should protect the central narrative and trim secondary interests rather than rushing through all of them.",
        "Use this framework — Begin with one or two grounding details, choose two formative experiences, connect them to what you are pursuing now, and end with one memorable non-medical detail. Prepare a full version of roughly ninety seconds and a shorter version, but follow the interviewer’s engagement rather than a rigid timer."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Why this program?",
      "introduction": "The strongest fit answers move from a program fact to its personal meaning instead of listing features from the website.",
      "bullets": [
        "Candidate’s answer — She names the appeal of a newer program with close faculty contact, describes residents’ reports of support and responsiveness to feedback, connects the location to family and lifestyle, and values exposure to forensic, geriatric, child and adolescent, and addiction psychiatry while her fellowship plans remain open.",
        "What works — The response combines several kinds of fit: training structure, culture learned from residents, breadth of clinical exposure, geography, and personal support. It could not be delivered unchanged to every program.",
        "What the interviewer can infer — She has researched beyond the homepage, spoken with residents, thought about how she learns, and considered whether the program can support both present needs and future exploration.",
        "What could be stronger — A personal location reason is useful, but it should not carry the whole response. One concrete curricular, clinical, teaching, or mentorship example should remain the anchor.",
        "Use this framework — Name a specific program feature, show how you verified it, explain why it matters to you, and connect it to the resident you hope to become. Two deeply understood reasons are more persuasive than six generic compliments."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Why psychiatry?",
      "introduction": "A specialty answer becomes persuasive when clinical fit, personal meaning, and a credible future contribution reinforce one another.",
      "bullets": [
        "Candidate’s answer — She is drawn to the uncertainty and human complexity of mental-health care, the therapeutic relationship, empathy, and psychotherapy. She connects those interests to addiction in her family, cultural stigma around mental illness in Pakistani and Asian communities, advocacy, and a desire to correct mental-health misinformation through public education.",
        "What works — Her reason extends beyond enjoying a rotation. Clinical experience, intellectual fit, family and cultural meaning, advocacy, and future work form one coherent professional identity.",
        "What the interviewer can infer — She understands that psychiatry involves ambiguity, sustained relationships, communication, and work against stigma; she can also name the communities and problems she hopes to serve.",
        "What could be stronger — Personal experience should illuminate motivation without becoming the only evidence of specialty fit. The clinical features of the work and what she learned while doing it should remain explicit.",
        "Use this framework — Connect a real clinical experience to the intellectual or interpersonal work that fits you, add personal meaning only where you are comfortable, and finish with the contribution you hope to make."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "What are your future goals?",
      "introduction": "Programs are usually looking for direction and thoughtfulness, not an irreversible ten-year contract.",
      "bullets": [
        "Candidate’s answer — She first commits to broad general psychiatry training, then identifies forensic and child and adolescent psychiatry as fellowships she wants to explore. She can imagine inpatient work, outpatient psychotherapy, and perhaps eventually owning a practice.",
        "What works — The answer is directional without pretending that every decision is settled before residency. It also returns to psychotherapy, reinforcing a theme already introduced in her specialty motivation.",
        "What could be stronger — Listing several settings can sound diffuse unless the candidate explains the common thread. One sentence about the patient population, clinical problem, or type of relationship connecting those possibilities would sharpen the answer.",
        "Use this framework — State what you know, identify what you hope residency will help you explore, and name the impact or kind of work that connects your current possibilities."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "What are your greatest strengths?",
      "introduction": "A strength matters only when the interviewer can see evidence of it and understand how it will help the residency team.",
      "bullets": [
        "Candidate’s answer — She chooses adaptability and supports it with the repeated transition between medical-school rotations, specialties, locations, supervisors, and teams.",
        "What works — Adaptability is directly relevant to residency, and the changing environments provide evidence rather than leaving the answer as an unsupported adjective.",
        "What could be stronger — The example proves exposure to change, but one brief moment showing how she adjusted her behavior, learned a new workflow, or helped a team would make the evidence more vivid.",
        "Use this framework — Choose two or three resident-relevant qualities you genuinely demonstrate, prepare one concrete example for each, and explain how each quality changes the way you work. Let other behavioral stories reveal these strengths too; do not save all evidence for the direct strengths question."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "What is a weakness you are working on?",
      "introduction": "The useful part of a weakness answer is the candidate’s self-awareness and response, not the label alone.",
      "bullets": [
        "Candidate’s answer — She describes people-pleasing that can lead her to overcommit and neglect sleep, nutrition, or recovery. She now uses reflection and journaling, communicates limits more clearly, and has sought classes and reading to improve.",
        "What works — The weakness has a real consequence, so it does not feel like a disguised compliment. Most of the response focuses on insight and corrective behaviors.",
        "What could be stronger — The answer would be more convincing with one recent example of setting a boundary, prioritizing responsibilities, or noticing the pattern early. Improvement is easier to trust when it is observable.",
        "Use this framework — Name a truthful limitation that does not fundamentally prevent safe residency work, explain its effect, describe the specific behaviors you changed, and give evidence that the change is underway. Avoid fake weaknesses such as caring too much or working too hard."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Tell me about your most memorable patient",
      "introduction": "A memorable-patient story should reveal what changed in your thinking or practice, not simply present an unusual diagnosis.",
      "bullets": [
        "Candidate’s answer — She recalls a patient with paranoid schizophrenia and psychosis whose life story initially seemed easy to discount. Collateral information later showed that much of the history was accurate, prompting reflection on diagnostic assumptions, the value of collateral history, and the disruption psychosis can cause in a previously high-functioning young adult.",
        "What works — The story contains a psychiatry-specific clinical lesson and acknowledges the risk of letting a diagnosis distort how the team hears a patient. Reflection gives the story more value than novelty alone.",
        "What could be stronger — The candidate could identify her own contribution more clearly: what she asked, obtained, communicated, or changed after recognizing the bias. Interviewers need to distinguish what the team did from what the applicant did.",
        "Use this framework — Protect confidentiality, establish the clinical or human tension, describe your role, name what surprised you, and finish with the lesson you now carry into patient care."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "Tell me about a difficult patient",
      "introduction": "Patient-centered language separates the person from the barrier that made communication or care difficult.",
      "bullets": [
        "Candidate’s answer — She reframes the premise and describes a difficult treatment and communication situation rather than a difficult person. A patient with schizophrenia, possible parkinsonism or dementia, medication side effects, and hard-to-understand speech needed time. She returned repeatedly, learned to understand him, and communicated his improvement to the team, helping discharge planning move forward.",
        "What works — The response avoids stigmatizing the patient, demonstrates patience, and identifies a concrete contribution available to a medical student. Her extra time becomes useful advocacy rather than a claim to have directed the entire plan.",
        "What the interviewer can infer — She listens, adapts her communication, notices improvement, and shares information that helps the team make a safer decision.",
        "Use this framework — Name the barrier, preserve the patient’s dignity, explain how you adjusted, identify your personal action, and show how the action changed understanding or care."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Tell me about conflict with a team member",
      "introduction": "The strongest conflict stories demonstrate accountability, repair, and a lasting change in professional behavior.",
      "bullets": [
        "Candidate’s answer — On an addiction-detox rotation, she documented a patient’s suicidal-sounding statement after obtaining permission from her attending. Another attending objected to the wording and its legal implications. She sought feedback, understood the concern, apologized directly, and learned to use greater care and context in sensitive documentation; the professional relationship improved.",
        "What works — She does not hide behind the first attending’s permission or portray the second physician as unreasonable. She owns her part, asks for feedback, repairs the relationship, and explains what she learned.",
        "What could be stronger — The final sentence should specify the documentation behavior that changed, such as clarifying exact language, context, risk assessment, and supervision. That converts a lesson into evidence of safer practice.",
        "Use this framework — Describe the disagreement neutrally, own your contribution, explain the direct conversation or repair, and end with what you now do differently. Avoid stories in which everyone else was wrong and your only action was to prevail."
      ],
      "links": []
    },
    {
      "number": 10,
      "title": "Tell me about teamwork and your responsibilities",
      "introduction": "Residency requires people who can lead, follow, organize, communicate, and complete unglamorous work reliably.",
      "bullets": [
        "Candidate’s answer — She draws from research teams, manuscript writing and editing, REDCap survey work, student government, orientation planning, secretary and treasurer duties, and community health education for young people.",
        "What works — The range shows technical, organizational, and service responsibilities, along with experience occupying different roles rather than presenting herself only as the leader.",
        "What could be stronger — Breadth can become a list. One focused team example with a goal, her assigned responsibility, an obstacle, coordination with others, and an outcome would reveal her teamwork more clearly.",
        "Use this framework — Choose a team with a real shared objective, identify your role precisely, show how you communicated or adjusted to others, and explain what the team accomplished. Include examples of both leadership and followership in your story bank."
      ],
      "links": []
    },
    {
      "number": 11,
      "title": "Tell me about a difficult obstacle",
      "introduction": "A setback answer is strongest when it diagnoses the failed process and proves that the candidate changed it.",
      "bullets": [
        "Candidate’s answer — She addresses a below-average Step 1 result. She had overstuddied, used too many resources, failed to take genuine breaks, and lost conceptual understanding through rote flashcard review. For Step 2, she emphasized physiology and question-based learning, improved recovery, and reports a twenty-nine-point score increase.",
        "What works — The answer contextualizes a visible application weakness without making excuses. It identifies several process failures, describes a different strategy, and supplies an objective outcome.",
        "What the interviewer can infer — She can examine disappointing performance, distinguish more effort from better strategy, and carry a learning-system change into the next challenge.",
        "Use this framework — State what happened, diagnose why your approach failed, describe the specific change, give a measurable or observable result, and explain what you now do differently. Do not spend the answer relitigating the score or blaming circumstances."
      ],
      "links": []
    },
    {
      "number": 12,
      "title": "Tell me about a time your integrity was tested",
      "introduction": "This is the least secure answer in the mock interview and is most useful as a warning to prepare a truthful example before interview day.",
      "bullets": [
        "Candidate’s answer — In college, a friend attempted to copy from her during science exams. She admits allowing it the first time, feeling uncomfortable afterward, then setting a boundary and offering to study together instead.",
        "What works — The response is candid, includes correction, and shows that integrity can require a difficult boundary with someone close to you.",
        "Why it is risky — The story includes an admission that she initially enabled academic misconduct. Honesty does not erase the concern, and an improvised answer can make the interviewer focus on the violation rather than the later growth.",
        "How to strengthen it — If you truthfully have a clinical or professional example in which you raised a concern, corrected an error, protected confidentiality, or resisted pressure, it may demonstrate current judgment more directly. Never invent or sanitize an incident.",
        "Use this framework — Explain the pressure or competing loyalty, state your decision and action clearly, acknowledge any mistake without evasion, and show the boundary or professional behavior you have maintained since."
      ],
      "links": []
    },
    {
      "number": 13,
      "title": "Tell me about a difficult ethical decision",
      "introduction": "Ethics answers need more than an emotionally difficult case; they need competing principles, a decision process, and attention to legal and professional limits.",
      "bullets": [
        "Candidate’s answer — She describes an involuntary psychiatric hospitalization for a manic patient who wanted to leave. She felt the tension between autonomy and safety, considered risk to the patient and others, helped calm the patient, and used a one-to-one meditation session and a clear explanation of the process to reduce fear.",
        "What works — The answer recognizes autonomy-versus-safety tension and does not reduce the case to a rule. It also shows empathy and supportive communication with a frightened patient.",
        "What could be stronger — The candidate herself recognizes that the example is not fully developed. She should distinguish observation from a decision she personally made, identify the information and supervision used, name the relevant principles, and explain her role within legal authority.",
        "Use this framework — Identify the competing duties, clarify the patient’s context and decision-making capacity where relevant, describe the information and supervision you sought, respect legal boundaries, explain the action, and reflect on how you supported the patient even when the outcome was uncomfortable."
      ],
      "links": []
    },
    {
      "number": 14,
      "title": "Extra tips: turn analysis into better interview performance",
      "introduction": "Good content loses force when the delivery feels memorized, disengaged, or needlessly long. Practice should create flexible fluency rather than a script.",
      "bullets": [
        "Build a story bank before interviews. Prepare truthful examples for patient care, teamwork, leadership, followership, conflict, feedback, adversity, integrity, and ethics; label the competencies each story can demonstrate.",
        "Research every program deeply enough to connect at least two specific clinical, teaching, mentorship, or community features to your goals. Confirm details from current program sources and conversations rather than repeating generic praise.",
        "Outline answers in beats instead of sentences. A situation, your action, the outcome, and the lesson are easier to adapt conversationally than a memorized paragraph.",
        "Record a complete mock interview and watch it back. Check facial expression, eye contact with the camera, vocal energy, filler words, long pauses, pacing, and whether the point of each answer is obvious.",
        "Use a natural smile when appropriate and maintain engaged eye contact. Serious patient or ethical stories do not require constant smiling; match expression to content while remaining warm and present.",
        "Calibrate length in real time. Ninety to one hundred twenty seconds can be a useful practice range for broad questions, not a formal rule. Shorten when the question is narrow or the interviewer signals closure; expand only when detail adds meaning.",
        "Put your action and reflection in every behavioral answer. If the story contains only what the team did, or ends before explaining what changed in you, the interviewer cannot assess your contribution or coachability.",
        "Protect patient confidentiality and use respectful language. Remove identifying details, distinguish a person from a difficult circumstance, and avoid using psychiatric diagnoses as shorthand for behavior.",
        "Do not copy this candidate’s wording or biography. The transferable lesson is answer architecture: relevance, specificity, evidence, reflection, resident fit, and responsive delivery."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$The strongest responses in this interview are not strong because they sound perfect. They are strong because the candidate connects a clear claim to a real experience, makes her own role visible, and reflects on what the experience changed. The program-fit, psychiatry-motivation, difficult-patient, conflict, and adversity answers do this especially well.$conclusion$,
    $conclusion$The weaker integrity and ethics responses are equally instructive: high-stakes questions are difficult to improvise, and honesty still needs careful structure. Prepare truthful examples, know the decision you made, and be ready to explain the professional reasoning and behavior that followed.$conclusion$,
    $conclusion$Your goal is not to reproduce a “perfect” answer. Build enough structure that you can listen closely, answer the question actually asked, and make the response unmistakably yours.$conclusion$
  ],
  null,
  jsonb_build_array(
    jsonb_build_object(
      'label',
      'Source mock interview — Perfect Residency Interview That PDs Would Rank #1 (Steal the Patterns)',
      'url',
      'https://www.youtube.com/watch?v=7fdYvaxlA9U&list=PLfOHpAhQHQ8U&index=19'
    )
  ),
  'psychiatry_residency_mock_interview_article_research.pdf',
  null,
  '2026-09-01',
  true,
  '2026-09-01 12:00:00+00'
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
  published_at = excluded.published_at;

do $$
declare
  live_analysis_count integer;
  old_featured_count integer;
begin
  select count(*)
  into live_analysis_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and slug = 'psychiatry-residency-mock-interview-answer-analysis'
    and published;

  select count(*)
  into old_featured_count
  from public.resources
  where classification = 'residency-and-matching'
    and slug in (
      'building-a-balanced-residency-program-list',
      'preparing-stories-for-residency-interviews'
    );

  if live_analysis_count <> 1 or old_featured_count <> 0 then
    raise exception
      'Expected one published live interview analysis and no replaced residency placeholders; found % live and % old',
      live_analysis_count,
      old_featured_count;
  end if;
end;
$$;

commit;
