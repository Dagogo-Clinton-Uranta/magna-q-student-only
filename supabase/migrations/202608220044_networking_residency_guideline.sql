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
  'networking-your-way-into-residency-2027',
  'Networking Your Way Into Residency: A Practical and Ethical 2027 Guide',
  'Relationships, insight and professional visibility',
  'Learn how to build genuine professional relationships, approach alumni and programs thoughtfully, prepare better through feedback, and stay within NRMP communication rules throughout the Match.',
  array[
    'Start early and build relationships through work people can actually observe.',
    'Approach alumni, residents and faculty with concise, specific requests for insight.',
    'Use program research, open houses and professional events to ask stronger questions.',
    'Turn mentorship and criticism into a better application and interview performance.',
    'Protect your reputation by respecting program instructions and SOAP communication restrictions.'
  ],
  'residency-and-matching',
  array[
    $preamble$Residency networking is purposeful relationship-building—not a shortcut around merit. It can help people understand how you work, give you better information about programs, improve your preparation and sometimes create legitimate advocacy from someone who truly knows you.$preamble$,
    $preamble$Networking cannot erase eligibility filters, guarantee an interview, reveal confidential ranking information or replace a strong application. The goal is not to collect names. It is to become a known, credible and professional candidate while learning enough to make better residency decisions.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Start early because relationships take time",
      "introduction": "Networking works best as a process rather than a last-minute request made after interview invitations begin.",
      "bullets": [
        "Begin months before application submission whenever possible.",
        "Do not wait until interview season to create every connection; residents and physicians may need weeks to respond.",
        "Maintain a simple contact log with the person, program, connection, dates, response, next action and useful details.",
        "Allow busy people time to reply and use only one polite follow-up when appropriate.",
        "Keep a real relationship alive by occasionally sharing a meaningful update or thanking someone—not by repeatedly requesting favors."
      ]
    },
    {
      "number": 2,
      "title": "Build your network where your work can be observed",
      "introduction": "Relationships are strongest when residents, faculty or collaborators have personally seen your professionalism and contribution.",
      "bullets": [
        "Seek legitimate clinical, research, academic, volunteer, quality-improvement or specialty experiences that put you around people who can observe your work.",
        "Be useful before trying to be memorable: prepare, arrive on time, follow instructions, communicate clearly, accept feedback and respect boundaries.",
        "For IMGs, learn U.S. clinical workflows, documentation, team roles and common electronic systems without exaggerating your hands-on responsibility.",
        "Ask thoughtful questions about training and careers before asking anyone for a recommendation.",
        "Earn advocacy from people who can describe specific qualities and examples they personally observed."
      ]
    },
    {
      "number": 3,
      "title": "Begin with alumni and genuine shared context",
      "introduction": "An alumnus may understand both a residency program and the transition you are trying to make, which can be especially helpful for IMGs.",
      "bullets": [
        "Review official resident and alumni pages, your medical school's alumni network, professional societies, LinkedIn, conference communities and faculty connections.",
        "Prioritize real common ground: medical school, institution, specialty, research field, region, mentor or professional organization.",
        "Ask for insight first—what the program values, what surprised them, how they prepared and whether your background appears compatible.",
        "If the relationship develops and the person knows your work, they may independently offer an introduction or advocacy.",
        "Never present a weak or brief contact as a close professional relationship."
      ]
    },
    {
      "number": 4,
      "title": "Make the first message short and specific",
      "introduction": "A busy resident or faculty member should understand who you are, why you selected them and what small request you are making within seconds.",
      "bullets": [
        "Use a greeting and your name, followed by one line describing your medical-school background, current role and specialty interest.",
        "State the genuine connection: alumnus, shared school, research interest, program interest, meeting, rotation or referral.",
        "Explain briefly why you contacted this person rather than sending a generic message to everyone.",
        "Make a small request such as one focused question, brief advice or a 10–15 minute call.",
        "Thank the recipient and make it easy to decline.",
        "Avoid a long autobiography, mass copy-paste outreach, repeated messages and an immediate request for an interview or recommendation."
      ]
    },
    {
      "number": 5,
      "title": "Research the program before contacting anyone",
      "introduction": "Networking becomes more useful when you already understand the program's publicly available basics.",
      "bullets": [
        "Read the program website fully and identify leadership, coordinators, current residents, training sites and the stated mission.",
        "Review recent news and faculty or research interests related to your goals.",
        "Understand the patient population, clinical setting, curriculum and major rotations.",
        "Check eligibility, visa policy, application service, deadlines and specialty-specific requirements.",
        "Use official social media to find announced open houses and events, but verify application rules on official sources.",
        "Prepare questions whose answers are not already obvious on the website."
      ],
      "links": [
        {
          "label": "AAMC guidance on program websites and virtual culture",
          "url": "https://www.aamc.org/services/admission-interview-foundations/conveying-your-program-and-culture-virtual-context"
        }
      ]
    },
    {
      "number": 6,
      "title": "Treat open houses as learning opportunities",
      "introduction": "Open houses and virtual events can reveal how leadership thinks and what a program values, but attendance is not a guaranteed audition advantage.",
      "bullets": [
        "Attend because you genuinely want to understand the program.",
        "Listen for repeated themes such as autonomy, mentorship, research, underserved care, wellness, teamwork and teaching.",
        "Write down the details that connect with your goals.",
        "Ask one thoughtful question when appropriate without dominating the event.",
        "A brief professional follow-up may be reasonable when someone discussed an area directly relevant to you.",
        "Use what you learn to improve later interview questions, but do not assume attendance is tracked or rewarded."
      ]
    },
    {
      "number": 7,
      "title": "Contact program directors with restraint",
      "introduction": "Direct contact can be appropriate when there is a legitimate purpose; a generic demand to review your application usually adds little.",
      "bullets": [
        "Reasonable purposes include an unanswered eligibility question, a meaningful prior connection, a trusted referral, a substantive research connection or a permitted update.",
        "Poor reasons include repeatedly asking whether your file was reviewed, demanding an interview, sending an unsolicited life essay or asking about rank position.",
        "Follow explicit no-contact, no-letter-of-interest and no-additional-material instructions.",
        "Send administrative questions to the program coordinator when that is the appropriate role.",
        "Never imply that persistence entitles you to attention or an interview."
      ]
    },
    {
      "number": 8,
      "title": "Use the referral ladder ethically",
      "introduction": "Professional networks often grow when one credible relationship leads naturally to another.",
      "bullets": [
        "Start with supervisors, faculty, alumni, residents you worked with, research collaborators and mentors.",
        "Ask whether there is someone else you should speak with to understand the specialty or program better.",
        "When introduced, describe the introducer and relationship accurately and thank both people.",
        "Do not ask every contact to lobby a program director for you.",
        "A referral is strongest when the person can honestly explain why you are worth meeting.",
        "Update the introducer only when there is a meaningful outcome."
      ]
    },
    {
      "number": 9,
      "title": "Network at conferences and professional societies",
      "bullets": [
        "Attend specialty meetings only when practical and financially sensible.",
        "Identify relevant sessions, speakers and posters before arriving.",
        "After a relevant presentation, introduce yourself with one specific observation or question.",
        "If presenting research, prepare both a 30-second explanation and a five-minute discussion.",
        "Exchange contact information only when there is a reason to continue the conversation.",
        "Follow up within a few days and remind the person where you met.",
        "Join organizations to learn and contribute—not simply to collect names."
      ]
    },
    {
      "number": 10,
      "title": "Use social media without spamming programs",
      "bullets": [
        "Keep public professional profiles accurate and consistent with your application.",
        "Follow programs for open houses, resident events, announcements and educational content.",
        "Use professional platforms to find alumni and legitimate shared connections, then personalize requests.",
        "Avoid mass-tagging directors, repeatedly commenting for visibility or publicly lobbying for an interview.",
        "Assume anything public could be seen by a residency program.",
        "Keep professional outreach separate from intrusive attempts to access someone's private life."
      ]
    },
    {
      "number": 11,
      "title": "Become someone others can recommend confidently",
      "introduction": "Effective networking depends less on artificial charm than on making your professionalism visible and reliable.",
      "bullets": [
        "Be dependable, teachable and constructive when corrected.",
        "Communicate respectfully with coordinators, nurses, residents, peers and staff—not only senior physicians.",
        "Show curiosity without constantly trying to display knowledge.",
        "Help the team within your actual role and scope.",
        "Avoid gossip and disparaging other applicants or programs.",
        "Explain setbacks without reflexively blaming other people.",
        "Thank people who teach you and follow through on every commitment."
      ]
    },
    {
      "number": 12,
      "title": "Turn criticism into stronger preparation",
      "introduction": "A useful network includes people willing to tell you what is not working—not only people willing to praise you.",
      "bullets": [
        "Ask specific questions instead of asking only whether a personal statement or interview answer is good.",
        "For writing, ask what feels generic, confusing, unsupported or forgettable.",
        "For mock interviews, ask where you ramble, sound rehearsed, miss the question or undersell meaningful experience.",
        "Practice with people who know you and people who do not.",
        "Do not argue with every criticism; look for repeated patterns across credible reviewers.",
        "Keep ownership of the final application so feedback improves rather than erases your authentic story."
      ]
    },
    {
      "number": 13,
      "title": "Use networking to ask better interview questions",
      "introduction": "Study programs with the same seriousness with which programs study applicants.",
      "bullets": [
        "Ask about something specific learned from a website, open house, resident conversation, publication or curriculum.",
        "Connect the question to your own goals where that connection is genuine.",
        "Ask residents about daily culture, autonomy, teaching, call, workload, support and living locally.",
        "Ask leadership about program direction, curriculum philosophy, mentorship, research, fellowship preparation and planned changes.",
        "Avoid questions answered prominently online unless you are seeking deeper context.",
        "Do not manufacture a personal question merely to appear memorable; relevance matters more than novelty."
      ]
    },
    {
      "number": 14,
      "title": "Keep post-interview communication disciplined",
      "introduction": "After an interview, communicate professionally and only for information you genuinely need to make a decision.",
      "bullets": [
        "Follow the program's stated post-interview communication policy.",
        "A concise thank-you may be appropriate where permitted, but do not assume it changes your rank position.",
        "Ask clarifying questions only when the answer matters to your own ranking decision.",
        "Never ask a resident, alumnus, faculty member or director to reveal where you will be ranked.",
        "Do not pressure contacts for promises or make misleading statements about your own ranking intentions.",
        "Rank programs according to your true preference after gathering the information you need."
      ]
    },
    {
      "number": 15,
      "title": "SOAP has different communication rules",
      "introduction": "Critical boundary: ordinary networking advice does not apply during SOAP. Applicants and anyone acting on their behalf must follow the current NRMP Match Participation Agreement and SOAP communication restrictions.",
      "bullets": [
        "Do not ask a mentor, alumnus, faculty member or school official to contact an unfilled Match-participating program when NRMP rules prohibit that outreach.",
        "Do not assume a private text message, direct message or phone call falls outside Match rules.",
        "SOAP-eligible applicants must use the authorized application process and may not contact a program until the program initiates communication after receiving the application.",
        "SOAP-ineligible applicants cannot contact Match-participating programs until SOAP concludes; separate timing applies to non-Match-participating programs.",
        "After SOAP concludes, unmatched applicants may contact remaining unfilled programs, subject to current NRMP guidance.",
        "When uncertain, rely on the current NRMP rules—not old advice or social-media posts."
      ],
      "links": [
        {
          "label": "NRMP SOAP guidance for applicants",
          "url": "https://www.nrmp.org/residency-applicants/soap/"
        },
        {
          "label": "NRMP guidance after the Match",
          "url": "https://www.nrmp.org/residency-applicants/after-the-match/"
        }
      ]
    },
    {
      "number": 16,
      "title": "Respond to rejection with useful persistence",
      "introduction": "Persistence is productive when it creates learning and a stronger legitimate attempt; it becomes harmful when it turns into repeated pressure.",
      "bullets": [
        "Do not personalize silence. After one reasonable follow-up, accept that a busy contact may not answer and move on.",
        "Separate outcome from information: a rejection may still reveal that the program list, geography, profile or specialty strategy needs reassessment.",
        "Conduct a post-cycle review of eligibility filters, USCE, letters, exams, writing, interviews and visa constraints with credible mentors.",
        "If reapplying, identify what will materially improve rather than simply repeating the same application.",
        "Keep relationships professional; someone unable to help this year may still become a colleague, mentor or collaborator.",
        "Protect your reputation by never attacking programs, arguing with rejection messages or pressuring contacts for explanations they cannot give.",
        "Stay open to legitimate alternative routes when informed mentorship suggests them."
      ]
    },
    {
      "number": 17,
      "title": "Use a twelve-month networking calendar",
      "bullets": [
        "9–12 months before applications: map specialties and programs, identify alumni and mentors, seek strong experiences and clean up professional profiles.",
        "6–9 months before: develop work-based relationships, attend relevant events, begin informational conversations and request honest CV feedback.",
        "3–6 months before: research programs, attend open houses, refine the list, identify genuine connections and prepare the application narrative.",
        "Submission period: use signals strategically, contact programs only for legitimate reasons and follow each program's instructions.",
        "Interview season: prepare program-specific questions, complete mock interviews and use alumni or resident insight to understand culture.",
        "After interviews: limit communication, clarify only what you need and create the rank list from genuine preference.",
        "If unmatched: follow SOAP rules exactly, then reassess with mentors and pursue legitimate post-SOAP opportunities while strengthening the next plan."
      ]
    },
    {
      "number": 18,
      "title": "Maintain a practical networking tracker",
      "bullets": [
        "Record the program, specialty, contact name, role and connection source.",
        "Write why the person is relevant and when you first contacted them.",
        "Record the response, advice received and appropriate follow-up date.",
        "Capture program-specific information, including any eligibility or visa issue discovered.",
        "Note possible introductions and whether you sent a thank-you.",
        "Add a boundary note for program communication rules or explicit no-contact instructions."
      ]
    },
    {
      "number": 19,
      "title": "Follow the ethical rules every time",
      "bullets": [
        "Tell the truth about credentials, relationships and intentions.",
        "Never fabricate a referral or imply endorsement that was not given.",
        "Do not seek confidential rank-order information.",
        "Never ask contacts to violate program or Match rules.",
        "Do not harass residents, coordinators or directors with repeated messages.",
        "Respect every program's stated communication preferences.",
        "Treat coordinators, residents, staff and other applicants with the same professionalism shown to faculty.",
        "Remember that advocacy is credible only when based on real knowledge of your work.",
        "During SOAP, follow the special NRMP communication restrictions."
      ],
      "links": [
        {
          "label": "NRMP Match Codes of Conduct",
          "url": "https://www.nrmp.org/intro-to-the-match/the-match-agreement/match-codes-of-conduct/"
        }
      ]
    },
    {
      "number": 20,
      "title": "Keep the final networking principles visible",
      "bullets": [
        "Start early, research before reaching out and ask for advice before asking for favors.",
        "Prioritize alumni and people with genuine shared context.",
        "Build relationships through work that other people can observe.",
        "Be concise, organized, reliable and receptive to criticism.",
        "Attend open houses to learn and use program directors' time carefully.",
        "Be memorable for preparation and fit—not aggressive persistence.",
        "Know when to follow up and when to move on.",
        "Treat rejection as information rather than an instruction to give up.",
        "Follow NRMP communication rules at every stage.",
        "Keep strengthening the application underneath the network."
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$A useful network gives your application context, gives you better information and connects you with people who can offer honest feedback. It works because real professional relationships make your preparation and conduct visible—not because a contact can bypass the Match.$conclusion$,
    $conclusion$A network may open a door, but your eligibility, preparation, professionalism and fit still have to carry you through it. Build relationships early, make small respectful requests, earn advocacy through observed work and protect every boundary of the recruitment process.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "NRMP — Match Codes of Conduct",
      "url": "https://www.nrmp.org/intro-to-the-match/the-match-agreement/match-codes-of-conduct/"
    },
    {
      "label": "NRMP — SOAP guidance for residency applicants",
      "url": "https://www.nrmp.org/residency-applicants/soap/"
    },
    {
      "label": "NRMP — After the Match",
      "url": "https://www.nrmp.org/residency-applicants/after-the-match/"
    },
    {
      "label": "AAMC — Conveying program culture in a virtual context",
      "url": "https://www.aamc.org/services/admission-interview-foundations/conveying-your-program-and-culture-virtual-context"
    }
  ]
  $sources$::jsonb,
  'networking_your_way_into_residency_2027.pdf',
  '2026-08-22',
  true,
  '2026-08-22 22:30:00+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
begin
  select count(*), jsonb_array_length(max(sections::text)::jsonb)
  into seeded_count, section_count
  from public.guidelines
  where slug = 'networking-your-way-into-residency-2027';

  if seeded_count <> 1 or section_count <> 20 then
    raise exception 'Expected one published 20-section networking guideline, found % article(s) and % section(s)', seeded_count, section_count;
  end if;
end;
$$;

commit;
