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
  'high-quality-letters-of-recommendation-2027-match',
  'How to Get High-Quality Letters of Recommendation for the 2027 Match',
  'Turn observed work into a letter that feels real',
  'Choose writers who know your work, give them specific evidence, and complete the 2027 MyERAS letter workflow early enough for programs to read a detailed, credible recommendation.',
  array[
    'See three real residency-letter stories and the details that made each one persuasive.',
    'Choose direct knowledge and enthusiastic support over title or prestige alone.',
    'Create observable moments during a rotation that a writer can describe rather than merely label.',
    'Ask explicitly for a strong letter and give the writer a concise evidence packet.',
    'Use the June-to-September 2026 timeline for the 2027 Match cycle.',
    'Follow the updated 2027 MyERAS and AAMC Letter Writer Portal process.',
    'Act immediately if your letters are still incomplete in late August 2026.'
  ],
  'residency-and-matching',
  array[
    $preamble$A strong letter of recommendation lets a program director picture you at work. It identifies how the writer knows you, describes specific actions the writer personally observed, interprets what those actions reveal about your readiness, and ends with an unambiguous level of support. A famous name attached to vague praise cannot do the same job.$preamble$,
    $preamble$The three worked stories below are faithful paraphrases of real residency letters. Identifying and clinical details remain omitted. They are examples of evidence and structure, not templates to copy. Your letter must reflect work your own recommender actually observed.$preamble$,
    $preamble$Timing in this article is aligned to the 2027 ERAS residency season and reviewed as of 28 August 2026. ERAS opened on 4 June 2026; applicants may begin submitting on 2 September; and programs may begin reviewing applications and MSPEs on 23 September. Individual specialties and programs can impose different letter types, counts, and deadlines, so their current instructions control.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Know what a high-quality letter must prove",
      "introduction": "The reader should finish the letter knowing what the writer observed, why it mattered, and how strongly the writer supports you.",
      "bullets": [
        "Context: the writer states their role, where and when they supervised you, the setting, and enough detail to establish direct knowledge of your work.",
        "Evidence: the writer uses one or more specific episodes, assignments, presentations, patient-care interactions, or team contributions instead of relying on a list of adjectives.",
        "Interpretation: the letter connects those actions to residency-relevant qualities such as clinical reasoning, communication, initiative, reliability, teamwork, adaptability, curiosity, and professionalism.",
        "Comparison or calibration: when truthful, the writer explains how you compare with other students, graduates, or volunteers they have supervised.",
        "Clear endorsement: the ending communicates the actual level of support with direct language rather than leaving the reader to guess.",
        "Specialty fit: the examples and conclusion should make sense for the specialty and the programs receiving the letter.",
        "A long letter is not automatically strong. Specific, credible detail is what separates a personalized recommendation from a generic one."
      ],
      "links": []
    },
    {
      "number": 2,
      "title": "Real letter 1: clinical curiosity became a teachable result",
      "introduction": "The first letter succeeds because it follows one distinctive nephrology episode from observation to action to scholarly output.",
      "bullets": [
        "Worked story — During a nephrology rotation, the student noticed an unusual finding on urine microscopy. She did not stop at noticing it: she contacted the hospital laboratory, confirmed the observation, searched the literature, and connected the finding to a treatment the patient was receiving.",
        "Worked story — She then organized the images and literature into a presentation for the faculty. The team learned something new from her work, and she developed the case into an abstract for submission.",
        "Why it works: the episode demonstrates observation, follow-through, independent learning, communication, teaching, and initiative in one coherent story.",
        "The writer could use active evidence—she noticed, contacted, confirmed, researched, prepared, and submitted—rather than simply calling her curious or hardworking.",
        "The story also supports specialty fit. The student showed sustained interest in internal medicine and nephrology through actions that happened during the rotation.",
        "A weak version would say only that the student was enthusiastic and performed well. The strong version gives the reader enough detail to reach that conclusion independently.",
        "Your lesson: look for a real clinical question, safety issue, teaching opportunity, or improvement task that you can pursue appropriately under supervision and complete well."
      ],
      "links": []
    },
    {
      "number": 3,
      "title": "Real letter 2: an IMG made readiness visible",
      "introduction": "The second letter does not ask the reader to assume that an IMG can adapt to United States training; it supplies observed evidence.",
      "bullets": [
        "Worked story — The writer first established the applicant's preparation: strong examination performance and completion of three United States clerkships. That context made the later observations easier to interpret.",
        "Worked story — During the rotation, the applicant learned the electronic medical record quickly, communicated clinical information clearly, asked informed questions during rounds and conferences, and presented an assigned topic on bloodstream infections effectively.",
        "Worked story — She also chose to attend an after-hours journal club and made use of outpatient learning opportunities. Those voluntary actions showed interest and effort beyond passive attendance.",
        "Why it works: the letter addresses questions a program may have about communication, adaptation, clinical foundation, and familiarity with the health system using direct observations.",
        "The strongest details are not the applicant's nationality or test scores alone. They are the concrete behaviors that show how she learns and contributes in a United States clinical environment.",
        "Your lesson: if you are an IMG, make adaptation observable—learn the workflow, ask how presentations are structured, seek feedback, communicate respectfully, and demonstrate improvement during the same experience.",
        "Do not ask a writer to make claims they cannot support. Build the evidence during the rotation, then remind the writer of the specific moments they personally saw."
      ],
      "links": []
    },
    {
      "number": 4,
      "title": "Real letter 3: a research mentor proved reliability",
      "introduction": "The third letter shows how research evidence can support a clinical residency application when it reveals transferable working habits.",
      "bullets": [
        "Worked story — The applicant contributed across the research process, including planning, implementation, literature searching, questionnaires, and preparation of abstracts rather than appearing only as a name on an output.",
        "Worked story — When the group needed a searchable electronic library for important data and publications, he investigated the available software and networking options and helped organize a workable solution.",
        "Worked story — The mentor described him as an integral, highly reliable problem-solver within a group that included numerous volunteers, then gave a direct and emphatic recommendation.",
        "Why it works: the examples demonstrate ownership, organization, problem-solving, dependability, communication, and completion—qualities that transfer directly to residency.",
        "A research letter is especially valuable when research occupies a major part of your application or you worked with the mentor for years. Omitting that mentor's perspective can leave an unexplained gap.",
        "The letter should still explain why the observed research behaviors predict performance in residency. A publication list without the applicant's role or working habits is less useful.",
        "Your lesson: keep a record of problems you solved, systems you improved, analyses or presentations you owned, and ways the team depended on you."
      ],
      "links": []
    },
    {
      "number": 5,
      "title": "Choose knowledge and enthusiasm over prestige",
      "introduction": "The best writer is usually an attending physician who directly supervised you and can support you strongly with specific examples.",
      "bullets": [
        "Prioritize an attending who knows your clinical work, judgment, communication, character, and growth. A title cannot replace direct observation.",
        "One real applicant received a detailed letter from a direct supervisor and a more superficial letter from a division chief who knew the work less well. The applicant used the detailed letter.",
        "Ask your advisor or student-affairs dean to help identify the best specialty-relevant writers when you have several credible choices.",
        "Check every target program before choosing the final set. A program may request a specialty letter, department-chair letter, standardized evaluation, or a particular number of letters.",
        "If several attendings rotate through one experience, ask the coordinator at the beginning how evaluation and letters are handled. A chief may be able to synthesize documented input from all supervisors.",
        "A mentor who observed substantial research can complement clinical letters, but should not automatically replace a required clinical or specialty-specific letter.",
        "Do not use a resident, fellow, nurse, or administrator as a substitute when the specialty or program expects attending-physician evaluation. Verify exceptions in the program's own requirements."
      ],
      "links": [
        {
          "label": "AAMC — choosing residency letter writers",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/letters-recommendation-residency-applicants"
        }
      ]
    },
    {
      "number": 6,
      "title": "Create letter-worthy evidence during the rotation",
      "introduction": "You cannot ethically manufacture a strong letter after the experience; you can make your real work easier to observe while the experience is happening.",
      "bullets": [
        "At the start, introduce yourself, state your specialty goal, ask about expectations, and learn the team's presentation, documentation, communication, and professionalism norms.",
        "Be punctual and prepared. Volunteer for appropriate presentations, literature reviews, case reports, patient education, or supervised improvement work when those opportunities genuinely exist.",
        "In a four-week experience, request a brief mid-rotation feedback meeting around the end of week two. Ask what you are doing well and what would make the remaining weeks more useful.",
        "Act visibly on the feedback. Improvement within the same rotation gives the writer a credible growth story.",
        "Keep a private, de-identified accomplishment log. Record dates, assignments, presentations, feedback acted upon, and outcomes without retaining protected patient information.",
        "At the end, thank the supervisor, summarize what you learned, and ask in person whether they know your work well enough to write a strong recommendation.",
        "Professionalism is not a performance for a letter. The behaviors must be consistent, safe, respectful, and genuine throughout the experience."
      ],
      "links": []
    },
    {
      "number": 7,
      "title": "Ask directly for a strong recommendation",
      "introduction": "The word strong gives the writer a respectful opportunity to agree enthusiastically or warn you that another writer would serve you better.",
      "bullets": [
        "Use a direct question: ‘Do you feel you know my work well enough to write a strong letter supporting my application to internal medicine?’ Adapt the specialty and context truthfully.",
        "If the writer hesitates, says the letter would be limited, or cannot meet the deadline, thank them and use a better-informed backup. A candid refusal is safer than an unseen lukewarm letter.",
        "Ask at the end of a strong rotation while your work is fresh. If the rotation happened earlier, ask then and reconnect in the application season so the writer can follow the current instructions and use an accurate date.",
        "Do not pressure the writer, dictate praise, or ask them to alter when the experience occurred. The date of the letter can be current; the dates and nature of the observed work must remain accurate.",
        "If a writer tells you to draft the entire letter for their signature, treat that as a warning about authorship, authenticity, and waiver status. Offer an evidence packet instead.",
        "A request may be sent by email when an in-person conversation is impossible, but it should still be individualized, concise, proofread, and clear about the deadline.",
        "Confirm the correct professional email and exact spelling, credentials, title, and department before creating the MyERAS entry."
      ],
      "links": []
    },
    {
      "number": 8,
      "title": "Give the writer an evidence packet",
      "introduction": "Make it easy to write a detailed, accurate letter without attempting to write the recommendation yourself.",
      "bullets": [
        "Include your current CV, draft personal statement when available, specialty and career goal, accurate rotation dates, target submission date, and the unique MyERAS Letter Request Form or portal link.",
        "Add copies of relevant evaluations and transcripts when useful and appropriate. The AAMC specifically recommends giving writers your CV, personal statement, evaluations, and transcripts if available.",
        "Attach a one-page accomplishment list limited to work the writer observed or can verify. Organize it by date or setting and keep patient information de-identified.",
        "Worked story — A useful reminder might say that you presented a literature review during rounds, discussed a guideline at case conference, completed an arterial-blood-gas analysis, attended morning report, and helped a resident develop an appropriate case abstract.",
        "For each important item, add the action, setting, result, and quality it may demonstrate. This helps the writer recover the story, but the writer decides what the letter says.",
        "State any program-specific format requirement, including a SLOE or department-chair requirement, and provide the official instructions rather than a second-hand summary.",
        "Keep the packet compact. A precise one-page evidence map is more usable than a folder of unranked certificates."
      ],
      "links": [
        {
          "label": "AAMC — how to ask for residency letters",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/letters-recommendation-residency-applicants"
        }
      ]
    },
    {
      "number": 9,
      "title": "Use the 2027 Match letter timeline",
      "introduction": "There is no single national letter deadline, but the opening and review dates create a practical working calendar.",
      "bullets": [
        "At every rotation end: ask while the work is fresh, preserve the writer's correct contact details, and keep a de-identified record of the evidence they observed.",
        "By 4 June 2026: the 2027 ERAS season opened. Applicants with earlier rotations should have reconnected with writers, confirmed current availability, created accurate letter entries, and sent the new-season request information.",
        "June and July 2026: this was the preferred working window for requesting or refreshing letters and completing later clinical experiences. The AAMC advises contacting writers at least four to six weeks before the applicable submission deadline.",
        "By early to mid-August 2026: applicants targeting a complete file near the beginning of September should have been monitoring uploads, checking specialty and program requirements, and activating backup writers where necessary.",
        "2 September 2026 at 9 a.m. ET: applicants may begin submitting MyERAS applications to residency programs. This is an opening date, not a universal program deadline.",
        "23 September 2026 at 9 a.m. ET: programs may begin reviewing applications and MSPEs. For planning purposes, aim to have required letters uploaded and correctly assigned before this review opening unless a program states another deadline.",
        "After 23 September: MyERAS may still permit an additional letter assignment when space remains, but the AAMC warns that a program is not guaranteed to review a letter received after its initial review."
      ],
      "links": [
        {
          "label": "AAMC — official 2027 ERAS residency timeline",
          "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
        }
      ]
    },
    {
      "number": 10,
      "title": "If it is 28 August 2026 and your letters are incomplete",
      "introduction": "You are late relative to the ideal June-to-July workflow and the AAMC four-to-six-week lead time, but immediate, organized action can still improve the application.",
      "bullets": [
        "Today: make a program-by-program letter matrix. Record the required count, specialty or chair requirements, standardized format, program deadline, and which uploaded letter will satisfy each requirement.",
        "Today: contact the strongest appropriate writers who already know your work. Ask clearly whether they can provide a strong letter and name the real target date; do not seek a vague letter from a stranger merely because it may arrive faster.",
        "Today: send each willing writer the compact evidence packet and their unique MyERAS request. Confirm that the request uses the 2027 season and the correct letter type.",
        "Agree on a reasonable check-in date. Because programs can begin reviewing on 23 September, you no longer have enough time for a first reminder three or four weeks from now.",
        "Activate credible backups now rather than waiting for a missed promise. You may assign no more than four letters to a program, and the program may require only two or three, so choose based on requirements and strength.",
        "Monitor MyERAS until each required letter shows Uploaded, then verify its assignment for every intended program. An entry, an upload, and an assignment are three different states.",
        "Do not misrepresent dates, write your own praise, or use an ineligible author to recover time. A late honest letter is safer than a fast misleading one."
      ],
      "links": [
        {
          "label": "AAMC — 2027 MyERAS letters workflow",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/letters-recommendation"
        }
      ]
    },
    {
      "number": 11,
      "title": "Complete the updated 2027 MyERAS workflow",
      "introduction": "The letter process changed for 2027. Use the current MyERAS fields and AAMC Letter Writer Portal rules.",
      "bullets": [
        "Create a separate MyERAS letter entry for every letter. Enter the author's name and email, choose the intended specialty or General, select standardized or narrative when available, and identify any department-chair requirement.",
        "Choose whether to waive your right to review the letter. The AAMC recommends waiving; if you waive, you may not view or obtain that letter under any circumstances.",
        "Proofread before confirming. Only entries that are Not Confirmed for Upload can be edited or deleted; correcting a confirmed entry requires creating a new entry.",
        "Confirm the entry to generate its unique Letter Request ID, then email or download that writer's Letter Request Form. Never duplicate one request for several authors.",
        "For 2027, the author or designee submits through the AAMC Letter Writer Portal using the unique request information. The applicant should not upload a waived letter.",
        "Wait for the MyERAS status to become Uploaded and for the notification, then assign the letter to the correct saved or applied programs.",
        "You may assign up to four letters to each program. Once a letter is assigned to a program you have applied to, it cannot be removed or replaced; review the complete assignment before acting."
      ],
      "links": [
        {
          "label": "AAMC — Letters of Recommendation in the 2027 MyERAS guide",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/letters-recommendation"
        },
        {
          "label": "AAMC — 2027 ERAS letter-process update",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/eras-news-and-announcements"
        }
      ]
    },
    {
      "number": 12,
      "title": "Check specialty-specific and standardized-letter rules",
      "introduction": "A beautifully written narrative letter can still be the wrong document if the specialty or program requires another format.",
      "bullets": [
        "Research every program's current requirements and use Residency Explorer or the relevant specialty guidance as a starting point. Programs control their own letter counts, author types, formats, and deadlines.",
        "For the 2027 season, the AAMC introduced specialty-specific standardized letters for dermatology, plastic surgery–integrated, and urology. Use the current official template and specialty instructions.",
        "MyERAS asks whether the request is for a standardized or narrative letter when those options apply. Plastic surgery–integrated does not offer the narrative-letter option in the current entry workflow.",
        "Emergency medicine and other specialties may have established evaluation-letter conventions outside the three new 2027 formats. Confirm the current specialty body instructions rather than assuming a general letter is sufficient.",
        "If selecting General for a letter intended for multiple specialties, note that the standardized-versus-narrative choices are unavailable. Decide whether a truly general letter meets each program's requirements.",
        "Do not use one specialty-specific letter for a different specialty merely to fill a slot. The examples, commitment, and endorsement should fit the application receiving it."
      ],
      "links": [
        {
          "label": "AAMC — 2027 specialty-specific standardized-letter announcement",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/eras-news-and-announcements"
        },
        {
          "label": "AAMC — research specialty and program letter requirements",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/letters-recommendation-residency-applicants"
        }
      ]
    },
    {
      "number": 13,
      "title": "Handle follow-up without damaging the relationship",
      "introduction": "You are responsible for tracking the request, but reminders should make the deadline visible without treating the writer like a delivery service.",
      "bullets": [
        "Thank the writer when they agree, when the upload arrives, and after the Match. A short, specific note is enough; gifts are never required.",
        "Monitor MyERAS rather than repeatedly asking whether the letter was sent. Follow up only when the agreed date approaches or passes, and include the deadline and request information again.",
        "If the writer becomes unavailable, respond professionally and move to a credible backup. Emergencies, leave, job changes, and administrative delays can occur.",
        "Keep the relationship professional after submission. Share a meaningful update or eventual Match result, but do not manufacture contact solely to influence what the writer says.",
        "If you do not match, the writer or advisor may still offer useful feedback for the next application. Do not assume the letter caused the outcome without evidence.",
        "Preserve your own tracking record: request date, promised date, upload status, specialty label, waiver choice, assigned programs, and thank-you date. Never store the content of a waived letter."
      ],
      "links": []
    },
    {
      "number": 14,
      "title": "Audit the final set from a program reader's perspective",
      "introduction": "The complete set should provide credible, complementary evidence rather than repeat the same generic claims four times.",
      "bullets": [
        "Does each writer have enough direct knowledge to describe your work accurately?",
        "Do the letters collectively cover clinical performance, communication, teamwork, reliability, growth, and specialty commitment where relevant?",
        "Is at least one memorable example likely to help a reader picture you contributing on a real team?",
        "Are all required specialty, chair, and standardized formats satisfied for each program?",
        "Are the author details, specialty labels, waiver choices, upload statuses, and program assignments correct?",
        "Have you avoided assigning a weaker fourth letter merely because MyERAS allows four? Follow the program's requested count and use only letters that add value.",
        "Can every accomplishment supplied to a writer be verified, discussed in an interview, and reconciled with the rest of your application?"
      ],
      "links": []
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$The strongest letters are earned before they are requested. Give a well-chosen attending or mentor enough direct evidence to describe how you observe, think, communicate, improve, solve problems, and support a team. Then ask clearly for strong support and make the administrative work easy.$conclusion$,
    $conclusion$For the 2027 Match, June was the preferred month to reactivate earlier writers, and late August is later than the ideal four-to-six-week lead time. It is not a reason to give up. As of 28 August 2026, act today, use writers who already know your work, send complete evidence packets, activate legitimate backups, and target correct upload and assignment before programs begin reviewing on 23 September.$conclusion$,
    $conclusion$Use these real-letter examples to understand the standard: not generic praise, but a credible story only your supervisor could tell. Follow the current AAMC instructions to deliver that story correctly in the 2027 season.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "Ed4MedUS — three real-life residency letters of recommendation",
      "url": "https://www.youtube.com/watch?v=OKHZ6j1MlIM"
    },
    {
      "label": "AAMC — letters of recommendation for residency applicants",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/letters-recommendation-residency-applicants"
    },
    {
      "label": "AAMC — Letters of Recommendation in the 2027 MyERAS Applicant User Guide",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/letters-recommendation"
    },
    {
      "label": "AAMC — official 2027 ERAS residency timeline",
      "url": "https://students-residents.aamc.org/eras-tools-and-worksheets-residency-applicants/2027-eras-residency-timeline"
    },
    {
      "label": "AAMC — 2027 ERAS news and letter-process updates",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/eras-news-and-announcements"
    },
    {
      "label": "AAMC — 2027 MyERAS Applicant User Guide",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
    }
  ]
  $sources$::jsonb,
  'Ed4MedUS YouTube video — 3 Real-life Letters of Recommendation',
  '2026-08-28',
  true,
  '2026-08-28 18:30:00+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
  story_count integer;
  wrong_classification_count integer;
begin
  select count(*), coalesce(max(jsonb_array_length(sections)), 0)
  into seeded_count, section_count
  from public.guidelines
  where slug = 'high-quality-letters-of-recommendation-2027-match';

  select count(*)
  into story_count
  from public.guidelines article
  cross join lateral jsonb_array_elements(article.sections) section
  cross join lateral jsonb_array_elements_text(section -> 'bullets') bullet
  where article.slug = 'high-quality-letters-of-recommendation-2027-match'
    and bullet like 'Worked story —%';

  select count(*)
  into wrong_classification_count
  from public.guidelines
  where slug = 'high-quality-letters-of-recommendation-2027-match'
    and classification <> 'residency-and-matching';

  if seeded_count <> 1
    or section_count <> 14
    or story_count < 7
    or wrong_classification_count <> 0
  then
    raise exception
      'Expected one published 14-section residency-only recommendation-letter guideline with at least seven worked-story examples; found % rows, % sections, % stories, and % wrongly classified rows',
      seeded_count,
      section_count,
      story_count,
      wrong_classification_count;
  end if;

  if not exists (
    select 1
    from public.guidelines
    where slug = 'high-quality-letters-of-recommendation-2027-match'
      and classification = 'residency-and-matching'
      and published
      and reviewed_at = '2026-08-28'
  ) then
    raise exception 'Recommendation-letter guideline metadata was not seeded correctly';
  end if;
end;
$$;

commit;
