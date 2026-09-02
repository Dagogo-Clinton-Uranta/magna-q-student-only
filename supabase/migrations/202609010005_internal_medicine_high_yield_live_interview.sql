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
  'internal-medicine-high-yield-live-interview-analysis',
  'Internal Medicine Mock Interview: Turning Strong Experiences Into Focused Answers',
  'Live interview analysis',
  'Study an unrehearsed Internal Medicine mock interview with an international medical graduate, then see how strong experiences can be rebuilt into concise answers that make responsibility, judgment, and fit easy to recognize.',
  array[
    'Analyze seven high-yield Internal Medicine interview questions.',
    'Compare the candidate’s core message with a tighter illustrative answer.',
    'Learn what an interviewer may infer from content, structure, and tone.',
    'Translate international training into evidence a U.S. interviewer can evaluate.',
    'Use practical timing, program-research, and behavioral-story frameworks.'
  ],
  'residency-and-matching',
  'Live Interview Analysis',
  array[
    $preamble$This live mock interview follows Arafa, a recent graduate of Alexandria Faculty of Medicine applying to Internal Medicine after completing approximately one year of Internal Medicine residency in Egypt. He also discusses U.S. clinical experiences, cancer-center volunteering, research, tutoring, fencing, and chess. He entered the exercise with little formal interview preparation, which makes the recording especially useful: the underlying experiences are strong, but their value is sometimes buried inside long or indirect answers.$preamble$,
    $preamble$The analysis below paraphrases the candidate and coach rather than treating either person’s wording as a script. Each major question includes the answer’s core message, what worked, what could concern or confuse an interviewer, and an illustrative revision built only from facts present in the transcript. Readers should borrow the structure—not the candidate’s biography—and replace every detail with their own truthful evidence.$preamble$,
    $preamble$The supplied transcript omits portions from approximately 9:33–10:47, 40:50–41:56, and 42:58–44:07. Those missing passages are not reconstructed. Where the coach later refers to an omitted response, this article labels the limitation and analyzes only what the preserved text supports.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "How to read this interview: strong material, weak signal control",
      "introduction": "The candidate does not lack experiences; he needs to decide which experience answers the question and stop once the point is proven.",
      "bullets": [
        "The recurring strength — He can draw from prior residency responsibility, resource-limited practice, U.S. clinical exposure, cancer-center service, research, tutoring, competitive fencing, and chess. These are credible sources of clinical readiness and individuality.",
        "The recurring problem — Answers begin with a useful idea, branch into several analogies or side arguments, and arrive late at the conclusion. The interviewer must work to identify the main message.",
        "What an interviewer may infer — The candidate is energetic, experienced, reflective, and comfortable speaking, but may need greater prioritization, concision, and audience awareness. The same facts could create a much stronger impression with tighter selection.",
        "The governing rule — One question does not require the whole application. Choose two or three points, attach proof, connect them to residency, and pause so the interviewer can continue the conversation.",
        "A practical frame — Answer first → evidence second → relevance third. If a detail does not help one of those three jobs, save it for a follow-up."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Tell me about yourself: give the interviewer a map",
      "introduction": "The opening contains excellent ingredients but does not establish the candidate’s origin, journey, and current direction in a clean sequence.",
      "bullets": [
        "Candidate’s answer — He introduces himself as a 2024 graduate, lists U.S. clinical experiences, research, a year of Internal Medicine residency in Egypt, cancer-center volunteering, tutoring, fencing, and chess, and ties these activities to discipline and willingness to work hard.",
        "What works — Prior residency is highly relevant; tutoring suggests service and communication; fencing and chess are memorable; discipline provides a coherent theme. The interviewer has many promising paths for follow-up.",
        "What weakens the answer — His Egyptian background appears only indirectly, too many credentials receive equal weight, and the AI comparison creates an avoidable distraction. Saying intelligence matters less because an AI is smarter could sound dismissive of clinical reasoning or invite a debate unrelated to his candidacy.",
        "What the interviewer needs — A brief orientation to who he is, the selected experiences that prepared him, why he is now pursuing U.S. training, and one human detail. This is a map, not a complete defense of the application.",
        "Illustrative revision — “I am a recent graduate of Alexandria Faculty of Medicine in Egypt. After graduation, I completed about a year of Internal Medicine residency, where I learned what it means to carry responsibility for patients and work calmly in a demanding clinical environment. I have also pursued U.S. clinical experience, research, cancer-center volunteering, and tutoring for students preparing for the USMLE. Outside medicine, competitive fencing and chess have reinforced the discipline and focus I bring to teams. I am now seeking U.S. Internal Medicine training where I can build on that foundation and continue growing as a clinician.”",
        "Why the revision works — It follows identity → preparation → current goal → distinctive personal evidence, while leaving enough unanswered for a real conversation. Aim for roughly 90 seconds and never exceed two uninterrupted minutes."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Why Internal Medicine? Choose the experience, not every possible reason",
      "introduction": "The candidate identifies the coordination and cognitive breadth that attract him to Internal Medicine, but comparison with other specialties dilutes the answer.",
      "bullets": [
        "Candidate’s answer — He enjoyed several rotations but felt most at home in Internal Medicine. He describes internists as the “maestro” coordinating complex care, values the specialty’s many branches, enjoys synthesizing information and bonding with patients, and knows from prior residency that he finds the difficult work satisfying.",
        "What works — This is based on lived responsibility rather than brief observation. Care coordination, complex problem-solving, breadth, and patient relationships are credible Internal Medicine motivations.",
        "What weakens the answer — Extended discussion of cardiology, gastroenterology, procedures, and surgery answers why other fields may be less suitable instead of deepening why Internal Medicine fits. Describing surgery mainly as hand skills may also alienate an interviewer or oversimplify colleagues’ work.",
        "What an interviewer may infer — The commitment is genuine, but the applicant could sound unfocused or unnecessarily comparative. A positive, specialty-centered answer feels more mature than diminishing another discipline.",
        "Illustrative revision — “During my year of Internal Medicine residency in Egypt, I found that I most enjoyed synthesizing several problems at once and coordinating the people involved in a patient’s care. I valued being responsible not only for a diagnosis, but also for how the ICU team, consultants, and longitudinal plan fit together. I also enjoyed building relationships with patients while managing complex disease. That combination of clinical reasoning, coordination, breadth, and continuity is what made Internal Medicine feel like the right long-term home for me.”",
        "Use this framework — Defining experience → two aspects of the specialty → what you did or observed → why the work fits how you want to practice."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "What are you looking for in a program? Convert a wish list into fit",
      "introduction": "Part of this answer is missing from the transcript, but the preserved material shows the difference between evaluating programs and explaining personal fit.",
      "bullets": [
        "Candidate’s preserved answer — He mentions geography and family or professional connections, IMG representation, diversity, academic and fellowship tracks, early hands-on involvement, procedural or ultrasound exposure, electives, guidance after residency, and the ability to mentor people who follow him.",
        "What works — He is considering support, belonging, clinical opportunity, mentorship, and career development rather than relying on prestige alone. Family and community support are legitimate fit factors.",
        "What needs focus — A catalogue of databases and program features does not tell the interviewer which three conditions matter most or how he would use them. “Why our program?” also requires verified details unique enough to show real research.",
        "What an interviewer may infer — The candidate has researched the application landscape, but could be describing almost any program. Fit becomes persuasive only when a program feature connects to his prior experience and next growth need.",
        "Illustrative program-neutral revision — “I am looking for three things: rigorous broad-based clinical training, early supervised responsibility, and mentorship that helps residents make thoughtful career decisions. Because I have already worked in a demanding Internal Medicine setting, I value programs where residents care for diverse pathology and progressively earn autonomy. I also want a community where I can learn from residents and eventually mentor others. I would then evaluate each program by speaking with residents and examining its clinical sites, curriculum, supervision, and mentorship outcomes.”",
        "For a real program — Replace general categories with two or three verified features: feature → source or example → connection to your experience → why it matters now. Do not praise a fellowship, clinic, or track that the program does not have."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "What strengths will help you thrive? Lead with the answer",
      "introduction": "The candidate eventually presents two persuasive strengths—tested clinical responsibility and calm under pressure—but begins by explaining the competition.",
      "bullets": [
        "Candidate’s answer — He first describes how programs choose among thousands of qualified applicants. He then points to a year of prior residency, the realities of long and stressful shifts, responsibility for a deteriorating patient, cancer-center experience, and the calm he developed through competitive fencing.",
        "What works — Prior residency makes readiness concrete. The clinical example shows awareness of deterioration and ownership, while fencing offers a memorable source of composure and team discipline.",
        "What weakens the answer — Discussion of applicant numbers and selection algorithms uses time without answering the question. References to eating or sleeping whenever possible can normalize exhaustion rather than demonstrate safe, sustainable performance. Saying observers are not blamed and “no one cares” may sound dismissive of learners’ duties and supervision.",
        "What an interviewer may infer — He understands pressure and has real responsibility, but must frame endurance as prioritization, communication, and safe escalation—not as tolerating deprivation or carrying everything alone.",
        "Illustrative revision — “Two strengths I would bring are experience with clinical responsibility and composure under pressure. During my year of Internal Medicine residency in Egypt, I learned to monitor complex patients, anticipate deterioration, communicate concerns, and stay accountable to the team. Competitive fencing developed a similar habit of remaining focused when events move quickly and adjusting without losing discipline. Together, those experiences have prepared me to be a dependable intern who stays calm, asks for help appropriately, and keeps patient needs prioritized.”",
        "Use this framework — Name two strengths → one concise proof for each → state how the program and its patients will experience those strengths."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "Where do you see yourself? Show direction without false certainty",
      "introduction": "The candidate’s honesty about uncertainty is appealing, but the original response gives the interviewer almost no professional destination.",
      "bullets": [
        "Candidate’s answer — He says 10 to 15 years is difficult to predict, values being open to opportunities, intends to give full effort to the present, wants to see where Internal Medicine leads, and hopes to have a family.",
        "What works — He avoids pretending to know a subspecialty before further experience and communicates adaptability, humility, and attention to the present.",
        "What weakens the answer — Emphasis on luck and inability to plan may sound passive. The interviewer is not demanding a binding forecast; they are testing whether training connects to a thoughtful professional direction.",
        "What an interviewer may infer — Without a provisional vision, the candidate may appear to have considered admission to residency more deeply than the physician he wants to become.",
        "Illustrative revision — “In 10 to 15 years, I hope to be a clinically strong internist working in a collaborative setting, with teaching and mentorship as part of my role. I want residency to expose me broadly before I decide whether fellowship is the right path, so I am intentionally keeping the subspecialty decision open. Given my training in Egypt and interest in helping other applicants, I could also see myself building educational or clinical connections across settings. The exact position may evolve, but excellent patient care, teaching, and service are the constants I want in my career.”",
        "Use this framework — Clinical identity → possible setting or focus → contribution beyond individual encounters → honest area still open to exploration."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Tell me about a conflict: a principle is not a story",
      "introduction": "The candidate gives thoughtful observations about burnout and negotiation, yet never anchors them in one completed event with his own actions and outcome.",
      "bullets": [
        "Candidate’s answer — He explains that negotiation occurs daily, describes a hypothetical conflict over obtaining urgent imaging for a patient with abdominal tenderness, notes that overworked colleagues deserve empathy, and suggests relationships and schedule changes can help resolve competing priorities.",
        "What works — He recognizes system pressure, approaches colleagues with empathy, distinguishes routine negotiation from major conflict, and keeps patient urgency central.",
        "What is missing — The interviewer asked for a time when something happened. The response moves between general principles and a hypothetical scenario, so the candidate’s exact decision, words, collaboration, outcome, and learning remain unknown.",
        "What an interviewer may infer — He understands conflict conceptually but may be avoiding the question, have difficulty selecting examples, or claim a result he did not personally produce.",
        "A stronger outline using a real event — Situation: one patient needed time-sensitive imaging while another service had competing demands. Task: clarify urgency without escalating interpersonal tension. Action: confirm the clinical concern, listen to the constraint, communicate the time-sensitive risk, involve the appropriate senior when needed, and help identify a feasible sequence. Result: state what actually happened to the plan and patient. Reflection: explain how the event changed later communication.",
        "Integrity rule — Do not take “artistic license” to mean inventing actions, outcomes, or responsibility. Reorganize a true event for clarity, de-identify the patient, and accurately distinguish what you did from what a resident, supervisor, or team did.",
        "Use this framework — Situation and task, briefly → your observable actions → outcome → reflection. The action should occupy the largest part of the answer."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "What is your weakness? Show a bounded improvement process",
      "introduction": "The original weakness exchange is absent from the supplied transcript, so only the coach’s preserved summary can be analyzed.",
      "bullets": [
        "According to the later feedback, the candidate considered procedural learning and attention to detail before identifying a more useful pattern: saying yes to too many commitments and risking under-serving some of them.",
        "Why procedural inexperience is weak here — Difficulty with a procedure that junior trainees are expected to learn may not reveal meaningful self-awareness unless the applicant explains a specific learning barrier and improvement process.",
        "Why overcommitment can work — It is credible, relevant to residency, and capable of change. It becomes an answer only when the applicant describes how it affected work, what system now guides decisions, and evidence that prioritization has improved.",
        "Illustrative revision — “Earlier in training, I sometimes agreed to too many requests because I wanted to be useful. I realized that overcommitting could make my work less reliable, which was unfair to people who were depending on me. I now review urgency and workload before committing, clarify deadlines, and speak early when priorities conflict. That has helped me protect the quality of the work I accept, although I still monitor the impulse to say yes immediately.”",
        "Avoid two extremes — Do not disclose a patient-safety red flag without context, but do not disguise praise as a weakness. Choose a genuine, professionally discussable limitation and show insight, action, and progress.",
        "Use this framework — Specific pattern → consequence → corrective system → evidence of improvement → continuing accountability."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Do you have questions for us? Prepare for the hard stop",
      "introduction": "The mock interviewer emphasizes that a scheduled interview may leave only a minute for questions, so preparation must survive time pressure.",
      "bullets": [
        "Have several questions ready even if you expect only one or two. Program presentations and resident events may answer your first choices before the interview begins.",
        "Match the question to the person. Residents can describe daily workflow and lived culture; program leaders can explain curricular priorities, responses to resident feedback, mentorship systems, and planned changes; faculty can discuss teaching and clinical or scholarly work.",
        "Ask beyond published facts. If the website lists a clinic, pathway, or outcome, ask how residents participate, how mentorship works, or what has changed because of the experience.",
        "Useful adaptable questions include: “What change has the program made in response to resident feedback?” “What distinguishes residents who thrive here?” and “How does mentorship evolve as a resident’s career interests become clearer?”",
        "If little official information exists, ask how the interviewer chose the program, what they see as its strengths and growth areas, and how residents experience supervision and autonomy. Do not pretend to know a feature you could not verify.",
        "Listen to the answer and ask a natural follow-up when time permits. Engagement is demonstrated more by responsive listening than by forcing every prepared question into the remaining seconds."
      ],
      "links": []
    },
    {
      "number": 10,
      "title": "The two-minute ceiling: make the interview a conversation",
      "introduction": "The coach’s most consistent delivery feedback is that several answers ran far beyond the point at which their central idea was already clear.",
      "bullets": [
        "Treat two uninterrupted minutes as a ceiling, not a target. “Tell me about yourself” may use 90 to 120 seconds; most direct and behavioral questions can often be answered in 60 to 90 seconds.",
        "Long answers are not automatically more complete. They can conceal the strongest evidence, reduce opportunities for follow-up, and make the interaction feel like a speech.",
        "Practice aloud with a timer because written length is deceptive. Record yourself, transcribe one answer, and mark the first complete proof of your point; material after that moment often belongs in a follow-up.",
        "Prepare three versions: a one-sentence headline, a 60-to-90-second answer, and one layer of detail for follow-up. This makes concision flexible rather than abrupt.",
        "Do not memorize every sentence. Memorize the route: answer, two points, evidence, relevance. Exact scripts can make applicants continue reciting after the interviewer has signaled a different interest.",
        "End decisively. A final sentence that names the lesson or residency relevance tells both people the answer is complete and gives the interviewer a clean place to respond."
      ],
      "links": []
    },
    {
      "number": 11,
      "title": "Translate IMG experience into evaluable evidence",
      "introduction": "International experience can be a major advantage when the interviewer can understand the role, supervision, resources, and responsibility behind it.",
      "bullets": [
        "Do not assume the title of an internship or residency means the same thing in every system. State the setting, level of responsibility, supervision, patient mix, and a representative task without inflating equivalence.",
        "Resource limitations can demonstrate careful history-taking, examination, prioritization, and adaptability. Frame them through safe judgment and teamwork—not through criticizing one system or implying that testing and consultation are unnecessary.",
        "U.S. clinical experience should show what you learned about communication, team roles, documentation, workflow, or patient expectations. Merely listing an observership or elective does not demonstrate readiness.",
        "Make responsibility precise. “I recognized deterioration and promptly escalated to my senior” may be stronger and safer than “the buck stopped with me” if final authority rested with a supervisor.",
        "Avoid minimizing observers, other specialties, or colleagues to elevate yourself. Professional maturity includes respecting different roles while accurately describing your own contribution.",
        "A useful translation sentence is: “In that role, I was responsible for ___ under ___ supervision; this taught me ___, which I would bring to internship by ___.”"
      ],
      "links": []
    },
    {
      "number": 12,
      "title": "Extra tips: build an interview system, not seven isolated scripts",
      "introduction": "The final step is deliberate rehearsal that preserves authenticity while making the strongest evidence easy to retrieve.",
      "bullets": [
        "Build a story bank of six to eight true experiences covering teamwork, conflict, feedback, failure, leadership, resilience, patient advocacy, communication, and asking for help. One story may answer several prompts when the emphasis changes.",
        "For every story, record the context, your role, action, outcome, reflection, and which claims it proves. Verify that you can distinguish individual work from team work.",
        "Create one program sheet per interview with two verified fit connections, one clinical question, one education or mentorship question, one resident question, and one concern you still need to investigate.",
        "Practice the opening and “Why Internal Medicine?” until their structure is automatic. Repetition does not require robotic wording; it frees attention for eye contact, listening, and follow-up.",
        "Remove risky detours: comparisons that diminish another specialty, jokes about exhaustion, claims that intelligence does not matter, assumptions about an interviewer’s values, and statements broader than your evidence.",
        "Ask a reviewer to tell you the two things they learned after each answer. If their summary differs from your intended message, revise the selection and order of evidence before changing your personality.",
        "Practice with different interviewers. One should be warm and conversational, another quiet and neutral, and another focused on behavioral follow-ups. Your structure should hold even when feedback cues change.",
        "On interview day, listen to the exact wording, answer it in the first sentence, support it with truthful evidence, and stop. A clear answer that invites conversation is more memorable than a comprehensive monologue."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$This candidate’s experiences are already compelling: prior Internal Medicine responsibility, cross-system clinical exposure, research and service, and competitive pursuits that support discipline and calm. The interview becomes stronger when those facts are selected rather than accumulated.$conclusion$,
    $conclusion$A good answer lets the interviewer identify the conclusion, the evidence, and the relevance without searching for them. It does not require perfect certainty, dramatic stories, or polished slogans. It requires a direct response, an accurate account of what you did, and reflection that shows how you will function as a resident.$conclusion$,
    $conclusion$Use the sample revisions as demonstrations of structure only. Your best version should remain factually yours, fit the program in front of you, respect the limits of your role, and leave room for the interviewer to turn preparation into conversation.$conclusion$
  ],
  null,
  '[]'::jsonb,
  'User-supplied transcript — unrehearsed Internal Medicine residency mock interview with live coaching',
  null,
  '2026-09-01',
  true,
  '2026-09-01 16:00:00+00'
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
  where slug = 'internal-medicine-high-yield-live-interview-analysis'
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

  if article_count <> 1 or live_analysis_count < 4 then
    raise exception
      'Expected the high-yield Internal Medicine article and at least four live analyses; found % article and % total',
      article_count,
      live_analysis_count;
  end if;
end;
$$;

commit;
