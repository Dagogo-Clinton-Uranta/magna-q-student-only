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
  'internal-medicine-residency-mock-interview-analysis',
  'Internal Medicine Residency Mock Interview: Answers and Live Analysis',
  'Live interview analysis',
  'Follow an international medical graduate through a complete Internal Medicine mock interview, then examine how the answers communicate clinical readiness, program fit, teamwork, research experience, and a genuine professional identity.',
  array[
    'See how an IMG can turn international training into evidence of clinical readiness and adaptability.',
    'Learn to answer “Why the United States?”, “Why Internal Medicine?”, and “Why our program?” without sounding generic.',
    'Study behavioral answers about conflict, teamwork, leadership, and reflection.',
    'Prepare to discuss every research project and experience listed in your application.',
    'Finish with practical advice for natural delivery and thoughtful questions for interviewers.'
  ],
  'residency-and-matching',
  'Live Interview Analysis',
  array[
    $preamble$This Internal Medicine mock interview follows an international medical graduate who was born in the United States, grew up partly in Jordan, completed medical school and an internship-equivalent year in London, and hopes to return to the United States for residency. Her interests in Cardiology, teaching, and research give the interview a clear direction, while her experience across three healthcare systems becomes the central evidence for adaptability and clinical perspective.$preamble$,
    $preamble$Each section paraphrases the candidate’s response, analyzes what an interviewer can learn from it, and turns the lesson into a reusable framework. The goal is not to copy her biography or wording. Your strongest answer will use the same principles—specificity, evidence, reflection, relevance, and responsive delivery—to make your own story easier to understand.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Tell me about yourself",
      "introduction": "The candidate gives the interviewer a compact map of where she comes from, how she trained, and what now brings her to Internal Medicine.",
      "bullets": [
        "Candidate’s answer — She introduces herself, explains that she was born in New Jersey, moved with her family to Jordan at age ten, and later attended Imperial College in London for undergraduate and medical training followed by an internship-equivalent year. She then connects medical school to growing interests in Internal Medicine and Cardiology, research, and teaching before explaining that she now wants to return to the United States for residency.",
        "What works — The response is chronological without becoming a list. Geography, training, specialty interest, and academic interests form one story, and the interviewer receives several useful follow-up paths.",
        "What the interviewer can infer — She has navigated major cultural and educational transitions, knows the direction of her career, and can explain how teaching and clinical and laboratory research strengthened her interest in Internal Medicine.",
        "What could be stronger — A short human detail outside medicine could make her easier to remember, provided it is genuine and does not crowd out the professional narrative. Not every hobby needs to appear; one meaningful detail is enough.",
        "Use this framework — Give your name and grounding context, select the training experiences that shaped you, connect them to your present direction, and end with why you are here now. Practice from bullet points so the answer stays near ninety seconds without sounding memorized."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Why do you want to train in the United States?",
      "introduction": "A strong answer combines a personal reason with firsthand evidence that the training environment fits the applicant’s goals.",
      "bullets": [
        "Candidate’s answer — She says the United States is home because she was born and spent her first ten years there. Professionally, she values hands-on and structured residency training, robust teaching, and research opportunities that fit her interests in Internal Medicine and possible Cardiology fellowship. U.S. elective rotations allowed her to observe residents, patient care, and teaching directly rather than relying on assumptions.",
        "What works — Personal belonging and professional fit reinforce one another. The elective experience gives her claims credibility and shows that she has tested her expectations against actual clinical exposure.",
        "What could be stronger — Broad praise such as “robust” or “streamlined” can apply to many systems. One concrete contrast—for example, graduated responsibility, continuity clinic, or a teaching structure she observed—would make the professional reason more precise.",
        "Use this framework — Explain the personal context if relevant, identify the training features that matter to you, provide firsthand evidence from U.S. clinical experience or careful research, and connect those features to the physician you want to become. Do not disparage the country or system in which you previously trained."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Why should we choose you?",
      "introduction": "The candidate answers a competitive question without criticizing or pretending to know the other applicants.",
      "bullets": [
        "Candidate’s answer — She first acknowledges that the pool contains many strong candidates and says she can speak only about what makes her distinctive. She then describes living and training across the United States, Jordan, and the United Kingdom; seeing different cultures and healthcare systems; learning efficiency, prioritization, resource stewardship, and physical-examination skills in a busy national health system; and building teaching and research skills through extracurricular work.",
        "What works — Her opening communicates collegiality. The answer then moves from biography to resident-relevant capabilities instead of treating international experience as interesting but unrelated background.",
        "What the interviewer can infer — She can adapt across systems, work with diverse patients, prioritize under pressure, use resources thoughtfully, teach, and contribute to scholarship.",
        "What could be stronger — The response makes several claims in succession. One concise clinical example showing prioritization or efficiency would give the strongest claim more weight and keep the answer grounded in patient care.",
        "Use this framework — Do not compare yourself with people you do not know. Name two or three qualities that are genuinely distinctive, attach evidence to each, and translate every experience into how you will function as a resident."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "Why our program?",
      "introduction": "Specific observation is more persuasive than generic praise, and this candidate has unusually strong evidence from an away rotation.",
      "bullets": [
        "Candidate’s answer — During a one-month Internal Medicine sub-internship at the program, she watched attendings give residents appropriate autonomy, saw residents lead communication and plan development, and learned through morning report and noon conference. She also names access to Internal Medicine and Cardiology experts, support for resident research and national presentations, and distinctive teaching and ultrasound curricula.",
        "What works — Every major reason is attached to something she personally observed or specifically researched. Her month at the institution demonstrates sustained interest and lets her discuss culture, autonomy, teaching, research, and curriculum with credibility.",
        "What the interviewer can infer — She understands how the program actually trains residents, can identify the environment in which she learns best, and has considered how both broad Internal Medicine and future Cardiology interests fit there.",
        "What could be stronger — The response is rich but long. Grouping the reasons into three themes—clinical responsibility, teaching, and academic development—would make the answer easier to follow.",
        "Use this framework — Name a specific feature, explain how you learned about it, describe why it matters to your development, and connect it to your contribution or goals. If you did not rotate there, use the current program website, resident conversations, faculty work, and information sessions; never ask a question whose answer is prominently displayed online."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "Where do you see yourself in five to ten years?",
      "introduction": "Programs want credible direction while recognizing that residency should still broaden and refine a trainee’s interests.",
      "bullets": [
        "Candidate’s answer — She expects to pursue fellowship training and is particularly interested in Cardiology, but she repeatedly keeps an open mind and wants residency exposure to the full range of Internal Medicine before making a final subspecialty decision.",
        "What works — The answer shows ambition without presenting residency as merely an obstacle before fellowship. She recognizes that her immediate responsibility is to become a strong internist.",
        "Why the balance matters — Excessive focus on one fellowship can make a program wonder whether the applicant will neglect other services or has misunderstood broad Internal Medicine training. Hiding a real fellowship interest is unnecessary; placing it within a commitment to comprehensive training is stronger.",
        "Use this framework — State the direction you currently see, explain what attracts you to it, identify what you still need to explore, and make clear that excellent general residency training comes first."
      ],
      "links": []
    },
    {
      "number": 6,
      "title": "Why Internal Medicine—and why Cardiology?",
      "introduction": "The candidate explains the work she enjoys rather than relying on the label of a favorite rotation.",
      "bullets": [
        "Candidate’s answer — She is attracted to the breadth of pathology and the opportunity to care for patients across acute inpatient illness, longitudinal outpatient disease, and critical care. Cardiology adds the ability to make a diagnosis and sometimes change a patient’s course rapidly: she recalls patients arriving acutely unwell with a STEMI or complete heart block, receiving catheter-based intervention or a pacemaker, and improving quickly.",
        "What works — Breadth, acuity, longitudinal care, physiology, and visible treatment response provide concrete reasons for the specialty. The examples show what she observed and why it mattered to her.",
        "What could be stronger — Dramatic procedural outcomes should not eclipse chronic disease, uncertainty, communication, and prevention. One example of longitudinal or complex multisystem care would make the Internal Medicine motivation more balanced.",
        "Use this framework — Identify the clinical problems and relationships that energize you, illustrate them with a de-identified patient experience, explain what you personally found meaningful, and connect a subspecialty interest back to the broad internist you first need to become."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Tell me about a miscommunication or negative interaction",
      "introduction": "The educational value of a conflict story lies in the response and reflection, not in making the disagreement sound dramatic.",
      "bullets": [
        "Candidate’s answer — She describes a disagreement with colleagues and focuses the resolution on direct, respectful communication. The people involved recognized that they shared the same goal, cleared the tension, and moved forward with a better working relationship.",
        "What works — She does not try to win the story by making the other person look unreasonable. The answer communicates calmness, perspective-taking, and willingness to repair a relationship.",
        "What could be stronger — The action should be more concrete than “we discussed it.” A strong version names what she said or asked, how she listened, which misunderstanding became clear, and what changed in her behavior afterward.",
        "Use this framework — Establish the disagreement briefly, describe your contribution without blame, spend most of the answer on the conversation and resolution, and finish with the behavior you carried forward. Programs are asking how you may respond when tired, stressed, and working with colleagues at 3 a.m.; a calm ordinary disagreement can demonstrate this better than an extreme story."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "Give an example of your teamwork skills",
      "introduction": "The candidate uses a medical-education project to demonstrate leadership, delegation, organization, and follow-through.",
      "bullets": [
        "Candidate’s answer — In medical school, she led the organization of a mock clinical examination using real patients for final-year students preparing for a stressful practical exam. The project required coordinating people and logistics, maintaining a checklist, delegating specific responsibilities, and following up rather than trying to complete every task herself.",
        "What works — The example has a clear shared goal, a defined leadership role, specific teamwork behaviors, and an outcome: participating students found the exercise useful.",
        "What the interviewer can infer — She can organize a complex project, trust colleagues with meaningful work, monitor progress, and reflect on the difference between leadership and doing everything herself.",
        "What could be stronger — One operational obstacle and the team’s response would show how the collaboration worked under pressure rather than only how it was planned.",
        "Use this framework — Define the team’s objective, state your exact responsibility, show how you coordinated or supported others, name a challenge, and close with both the outcome and what you learned about working in a team."
      ],
      "links": []
    },
    {
      "number": 9,
      "title": "Do you have any questions for me?",
      "introduction": "A thoughtful question should deepen the conversation, reveal useful information, and reinforce a genuine interest already present in the application.",
      "bullets": [
        "Candidate’s answer — She acknowledges that conversations with residents and faculty have answered most of her questions, then asks whether residents can teach medical students beyond their interactions on the wards. The interviewer describes history and physical-examination workshops, ward teaching, lectures, and other education roles.",
        "What works — She still has a purposeful question, and it connects directly to the teaching identity she established throughout the interview. The answer gives her information she can use when assessing fit.",
        "What could be stronger — If time allowed, she could ask how residents are prepared for or receive feedback on teaching. That would move from availability to quality and development.",
        "Use this framework — Prepare questions for program leadership, faculty, and residents. When possible, tailor the question to the interviewer’s role or scholarship. Ask about mechanisms, examples, or anticipated changes rather than facts already listed online, and respect the clock instead of forcing a long question into the final seconds."
      ],
      "links": []
    },
    {
      "number": 10,
      "title": "What made the overall delivery effective",
      "introduction": "The reviewers praise the interview’s friendly, energetic, conversational quality more than any single polished phrase.",
      "bullets": [
        "The candidate sounds pleased to be present, responds to the interviewer’s wording, and moves between ideas smoothly. Her energy communicates interest without becoming theatrical.",
        "She uses prepared structure but does not appear to read. The coaching discussion recommends practicing from bullet points because complete scripts encourage eye movement, monotone delivery, and answers that no longer respond to the conversation.",
        "A useful standard is to approach the interaction with the confidence of extensive practice and the fresh interest of a first interview. Repeating the same answer across many programs should not erase spontaneity.",
        "Answer length must remain responsive. Roughly ninety seconds can work for a broad opening, but the interviewer’s engagement, question scope, and remaining time matter more than a fixed rule.",
        "The interview is not an interrogation. Programs are also asking whether this person seems genuine, kind, mature, thoughtful, and able to communicate—someone colleagues would want beside them during a difficult shift."
      ],
      "links": []
    },
    {
      "number": 11,
      "title": "Tailor the same story to the program",
      "introduction": "Preparation should identify the experiences worth discussing, while program research determines which parts deserve emphasis.",
      "bullets": [
        "An academic program with substantial research infrastructure may reasonably hear more about scholarship, mentors, and unanswered questions. A community program may need clearer evidence that an applicant with extensive research experience is primarily committed to clinical work and patient care.",
        "Tailoring is not changing the truth. It is selecting the most relevant truthful evidence for the program’s mission, setting, patients, and curriculum.",
        "Do not assume every interviewer has read every line of the application. Some may intentionally conduct a more blinded interview. Important strengths still need to appear naturally in stories rather than as a recitation of publications and positions.",
        "Research the program’s clinical sites, patient populations, rotation structure, teaching methods, resident autonomy, distinctive curricula, fellowship exposure, and current faculty work. Then decide which two or three connections are genuinely yours.",
        "The test for specificity is simple: if your answer could be delivered unchanged to nearly every accredited Internal Medicine program, it is not yet a strong “Why us?” answer."
      ],
      "links": []
    },
    {
      "number": 12,
      "title": "Translate IMG experience into resident readiness",
      "introduction": "International experience becomes persuasive when the candidate explains what it taught and how that capability transfers to U.S. residency.",
      "bullets": [
        "Language, cultural fluency, work across different health systems, high patient volume, limited-resource decision-making, and responsibility during internship or prior residency can all be meaningful strengths. The interviewer cannot infer their intensity from an unfamiliar institution name alone.",
        "Quantify or illustrate the work honestly: describe the level of acuity, approximate responsibility, prioritization demands, supervision, and one example of adapting care to available resources.",
        "Residency is first a clinical job. Research, leadership, and teaching add value, but the answer must still help a program trust that the applicant can care for patients, learn the local workflow, communicate with the team, and ask for help appropriately.",
        "U.S. clinical experience can show familiarity with documentation, rounds, communication, team roles, and patient expectations. Pair it with international experience rather than presenting either as automatically superior.",
        "Address visible concerns through evidence throughout the interview. An older graduate or someone who spent several years in research can mention recent clinical exposure and maintained skills before an interviewer has to ask whether clinical readiness has faded."
      ],
      "links": []
    },
    {
      "number": 13,
      "title": "Build behavioral answers around action and reflection",
      "introduction": "The transcript’s coaching reduces behavioral answers to three priorities: a brief situation, the applicant’s response, and what changed afterward.",
      "bullets": [
        "Prepare a flexible story bank for disagreement, miscommunication, teamwork, leadership, feedback, a positive interaction, a negative interaction, a near miss, failure, resilience, and patient advocacy. One truthful story may answer several questions when reframed carefully.",
        "Keep the setup short. Applicants often spend most of the answer explaining the problem and only seconds on what they did; the action and learning are the evidence an interviewer needs.",
        "Make your personal contribution visible without taking credit for the entire team. Use “I” for your decision and action, and “we” for shared work and outcomes.",
        "Show calm communication, empathy, perspective-taking, accountability, and a respectful resolution. Avoid examples that reveal uncontrolled anger, retaliation, or a refusal to consider your own contribution.",
        "When a patient is involved, close the loop on what happened to the patient. This keeps the story centered on care rather than turning the patient into a prop for the applicant’s achievement."
      ],
      "links": []
    },
    {
      "number": 14,
      "title": "Be ready to discuss every research and CV entry",
      "introduction": "Anything placed in the application can become the interviewer’s entry point, including an older project the applicant no longer expects to discuss.",
      "bullets": [
        "For a research question, explain the project’s purpose in one or two sentences, then spend more time on your actual role and what you learned. The interviewer needs to know whether you reviewed charts, recruited participants, performed laboratory work, analyzed data, wrote the manuscript, or merely observed.",
        "Describe a method or skill you can now carry forward: study design, statistical reasoning, literature review, collaboration, writing, responding to failure, or communicating uncertainty.",
        "Review every paper, abstract, quality-improvement project, volunteer activity, and experience before interview season. An interviewer may ask about a ten-year-old project because it connects to that interviewer’s interests.",
        "Do not list work you cannot discuss honestly. A line intended as a strength can become a credibility problem if the applicant cannot explain the question, contribution, result, or lesson.",
        "Avoid a two-minute technical lecture unless the interviewer asks for it. Clinical relevance, your role, and reflective learning usually reveal more about residency readiness than exhaustive scientific background."
      ],
      "links": []
    },
    {
      "number": 15,
      "title": "Extra tips for your own Internal Medicine mock interview",
      "introduction": "The best preparation gives you flexible control of your story while leaving enough attention to listen and respond like a person.",
      "bullets": [
        "Write a one-page message map: three qualities you want the program to remember, the stories that prove them, and the visible application concerns you should address with evidence.",
        "Prepare full and shorter versions of “Tell me about yourself,” “Why Internal Medicine?”, “Why the United States?”, and your most important behavioral stories.",
        "For every program, write two specific reasons, one contribution you could make, and separate questions for the program director, faculty, and residents.",
        "Record a mock interview. Review eye contact, facial expression, energy, filler words, pauses, answer length, whether you actually answered the question, and whether your delivery feels conversational rather than read.",
        "Practice explaining every application entry with three beats: what the experience was, what you personally did, and what you learned or changed.",
        "Prepare both leadership and followership examples. Internal Medicine depends on knowing when to direct work, when to support another person’s expertise, and when to ask for help.",
        "Use interview day to assess the program too. Record impressions soon afterward because programs can blur together; note culture, resident candor, clinical responsibility, feedback, teaching, support, and any unanswered concern that may affect your rank list.",
        "Do not memorize this candidate’s answers. Borrow the architecture, then speak in your own language about experiences you can defend in detail."
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$This interview works because its central claims stay consistent. The candidate’s movement across three countries supports adaptability; her U.K. clinical training supports prioritization and resource awareness; her U.S. elective supports readiness for the local environment; and her teaching, research, and Cardiology interests explain what she hopes to build during residency.$conclusion$,
    $conclusion$The most transferable lesson is not the candidate’s biography. It is the discipline of turning each experience into evidence: what happened, what you did, what it taught you, and why that matters to the program and its patients.$conclusion$,
    $conclusion$Prepare thoroughly enough to know your stories and the program, then stop trying to sound perfect. Listen, respond, respect the clock, and let the interviewer meet the thoughtful future colleague behind the application.$conclusion$
  ],
  null,
  '[]'::jsonb,
  'User-supplied transcript — Internal Medicine residency mock interview',
  null,
  '2026-09-01',
  true,
  '2026-09-01 14:00:00+00'
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
  internal_medicine_count integer;
  live_analysis_count integer;
begin
  select count(*)
  into internal_medicine_count
  from public.resources
  where slug = 'internal-medicine-residency-mock-interview-analysis'
    and classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published
    and jsonb_array_length(sections) = 15;

  select count(*)
  into live_analysis_count
  from public.resources
  where classification = 'residency-and-matching'
    and resource_section = 'Live Interview Analysis'
    and published;

  if internal_medicine_count <> 1 or live_analysis_count < 2 then
    raise exception
      'Expected the Internal Medicine article and at least two live analyses; found % Internal Medicine and % total',
      internal_medicine_count,
      live_analysis_count;
  end if;
end;
$$;

commit;
