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
  'nrmp-rank-order-list-matching-algorithm-2027',
  'How to Build Your NRMP Rank Order List — and Understand How the Matching Algorithm Actually Works',
  'Rank honestly, certify carefully and let the algorithm work',
  'Build your 2027 NRMP Rank Order List from genuine preferences, understand tentative matches and displacement through worked applicant stories, and certify the correct program codes before the deadline.',
  array[
    'Understand what applicant-proposing means and why true preference is the safest strategy.',
    'Follow Sally, John, Suraj and Jamil through tentative matches, displacement and final placement.',
    'Learn why a reach program cannot cost you a lower-ranked acceptable option.',
    'Use the “Would I rather go unmatched?” test before adding a program.',
    'Compare training, culture, lifestyle, career goals, geography, family needs and visa policy.',
    'Verify program codes and tracks, then save, certify and re-certify every change.',
    'Use the official 2027 ranking and Match Week deadlines.'
  ],
  'residency-and-matching',
  array[
    $preamble$After months of applications, interviews, signals and program research, the Rank Order List asks one decisive question: where do you actually want to train? Your answer—combined with the preferences submitted by programs—determines the Match outcome.$preamble$,
    $preamble$The central strategy is simpler than the rumors: rank programs in your genuine order of preference, not in the order you believe they are most likely to rank you. The NRMP algorithm is applicant-proposing, so it attempts your first choice before moving down only when necessary.$preamble$,
    $preamble$The fictional hospitals and applicants below simplify quotas to teach the core logic for an individual applicant. Couples, supplemental rank lists, reversions and certain program structures add rules that require the current NRMP instructions. The official Match Participation Agreement and R3 system always control.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Know what a Rank Order List represents",
      "introduction": "A Rank Order List, or ROL, is the ordered list of programs where you are willing to train, from your most preferred to your least preferred acceptable option.",
      "bullets": [
        "Story example — Sally interviews at six Internal Medicine programs and ranks Lakeside University Hospital, Green Valley Medical Center, Jefferson Community Hospital, Riverside Medical Center, Central City Hospital and St. Mary’s Medical Center—in that order.",
        "Sally is telling the algorithm: try Lakeside first; if Lakeside cannot ultimately take me, try Green Valley; continue until reaching the highest program that can match with me.",
        "Programs submit lists too. Lakeside might rank Jamil first, Sally second, John third and Suraj fourth, followed by other acceptable applicants.",
        "Applicants rank only programs they would accept. Programs rank only applicants they would accept. The algorithm compares both sides’ final certified preferences.",
        "Your application list and interview list are not your ROL. An application does not become rankable merely because you submitted it."
      ]
    },
    {
      "number": 2,
      "title": "Follow the most important rule: rank what you want",
      "introduction": "Do not reorder programs according to where you think you have the best chance. Tell the algorithm the truth about your preferences.",
      "bullets": [
        "Suppose Suraj genuinely prefers a highly competitive Program A, followed by University Program B, Community Program C and Community Program D. That is the order he should submit.",
        "If Program C appeared enthusiastic while Program A felt uncertain, Suraj should not move C above A unless his own preference actually changed.",
        "The algorithm tries A first. If A cannot hold Suraj, it tries B; if B cannot hold him, it tries C. Ranking A first does not erase C.",
        "Do not convert perceived probability into preference. You do not know the program’s final list, and you do not need to know it for the algorithm to work.",
        "If every program offered you a position today, your #1 should be the one you would freely choose. Repeat the question for every next position."
      ],
      "links": [
        {
          "label": "NRMP — rank your programs",
          "url": "https://www.nrmp.org/residency-applicants/rank-your-programs-main/"
        }
      ]
    },
    {
      "number": 3,
      "title": "Understand the applicant-proposing algorithm",
      "introduction": "Imagine every applicant moving down their own list and asking each program, in preference order, whether it can tentatively hold them.",
      "bullets": [
        "An applicant first proposes to the program ranked #1.",
        "If the program ranked the applicant and has an open position—or prefers that applicant to someone it is currently holding—the program tentatively holds the applicant.",
        "Tentative is essential. A program may later receive a proposal from an applicant it ranks more highly.",
        "When a more-preferred applicant arrives, that applicant can displace the less-preferred tentative match.",
        "The displaced applicant resumes at the next program on their own ROL; they do not restart and they do not automatically become unmatched.",
        "The process continues until applicants are tentatively matched or have exhausted their lists and no further displacement changes the result.",
        "The algorithm seeks the most preferred achievable program for each applicant under both sides’ certified preferences and program quotas."
      ],
      "links": [
        {
          "label": "NRMP — how the matching algorithm works",
          "url": "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/"
        }
      ]
    },
    {
      "number": 4,
      "title": "See tentative displacement with Sally and John",
      "introduction": "A one-position example shows why a tentative match can change without destroying the displaced applicant’s remaining choices.",
      "bullets": [
        "Green Valley has one position. Sally ranks Green Valley first and Riverside second. John ranks Green Valley first and Central Hospital second.",
        "Green Valley ranks John first and Sally second.",
        "Story example — Sally proposes first. Green Valley has an empty position and ranked her, so it tentatively holds Sally.",
        "John then proposes to Green Valley. Because Green Valley ranks John above Sally, it tentatively holds John and releases Sally.",
        "Sally continues to Riverside, her second choice. If Riverside ranked her and has room—or prefers her to someone it holds—she can match there.",
        "The order in which this story is narrated does not give Sally a permanent advantage. The final result must respect the submitted preferences and available positions."
      ]
    },
    {
      "number": 5,
      "title": "Set up the four-applicant Match",
      "introduction": "Now follow four applicants competing for three one-position Internal Medicine programs.",
      "bullets": [
        "Sally ranks Mercy University → Riverside Hospital → Central Medical Center.",
        "John ranks Mercy University → Central Medical Center → Riverside Hospital.",
        "Suraj ranks Riverside Hospital → Mercy University → Central Medical Center.",
        "Jamil ranks Mercy University → Riverside Hospital → Central Medical Center.",
        "Mercy ranks Jamil → Sally → John → Suraj.",
        "Riverside ranks Sally → Suraj → John → Jamil.",
        "Central ranks John → Suraj → Jamil → Sally.",
        "In the first round, Sally, John and Jamil propose to Mercy while Suraj proposes to Riverside. Mercy tentatively holds Jamil, its highest-ranked proposer; Riverside tentatively holds Suraj. Sally and John continue searching."
      ]
    },
    {
      "number": 6,
      "title": "Watch Sally displace Suraj at Riverside",
      "introduction": "A filled position is not closed while the algorithm is still processing more-preferred applicants.",
      "bullets": [
        "Mercy cannot hold Sally because it prefers Jamil, so Sally moves to Riverside, her second choice.",
        "Riverside currently holds Suraj, but its program list ranks Sally above Suraj.",
        "Story example — Riverside releases Suraj and tentatively holds Sally. Sally has not ‘taken’ a guaranteed position; the program has simply retained the proposer it prefers more.",
        "Suraj returns to his own list. Riverside has failed, so he proposes next to Mercy.",
        "Mercy still prefers Jamil, so Suraj continues to Central. Central is empty and ranked him, so it tentatively holds Suraj."
      ]
    },
    {
      "number": 7,
      "title": "Watch John produce the final result",
      "introduction": "The same displacement rule applies again when John reaches Central.",
      "bullets": [
        "John also failed to obtain Mercy. His second choice is Central, which currently holds Suraj.",
        "Central ranks John above Suraj, so Central tentatively holds John and releases Suraj.",
        "Suraj has now exhausted Riverside, Mercy and Central. With no additional ranked program, he ends the process unmatched.",
        "Worked story — The stable result is Mercy → Jamil; Riverside → Sally; Central → John; Suraj → unmatched.",
        "Suraj’s earlier tentative positions were never promises. Tentative matches become final only after the algorithm has completed its processing.",
        "This result does not mean Suraj ranked badly. It means none of the programs on his finite list could ultimately hold him under the combined preferences and quotas."
      ]
    },
    {
      "number": 8,
      "title": "Stop trying to guess program rank lists",
      "introduction": "Encouraging interview comments and post-interview messages are not reliable substitutes for a certified program ROL.",
      "bullets": [
        "Suppose Sally genuinely prefers Mercy, then Riverside, then Central. Riverside tells her she would be an excellent fit, while Mercy gives no hint.",
        "If Mercy remains Sally’s true first choice, she should still rank Mercy first. If Mercy cannot take her, the algorithm reaches Riverside anyway.",
        "Do not translate ‘We hope to see you here’ into ‘You are ranked to match.’ Professional warmth is not a verifiable rank position.",
        "Do not build your ROL around WhatsApp groups, Reddit reports, shared spreadsheets, classmates or rumors about how far a list usually falls.",
        "Your goal is not to reverse-engineer the program’s ROL. Your goal is to submit an accurate version of your own."
      ]
    },
    {
      "number": 9,
      "title": "Reject the reach-program and confidentiality myths",
      "introduction": "Two common fears lead applicants to misstate their preferences.",
      "bullets": [
        "Myth—‘If I rank them #5, they will know and be offended.’ Programs do not receive your ordered applicant ROL for use in constructing their own list.",
        "If Jamil ranks a program seventh and the program ranks Jamil first, the algorithm attempts Jamil’s first six choices before reaching that program. The program’s preference for Jamil remains its own submitted preference.",
        "Myth—‘Ranking a reach program first could cost me my safety program.’ A lower-ranked program remains available for consideration if the higher choices cannot ultimately hold you.",
        "John should submit Dream University → State University → Community Hospital if that is his genuine preference, even if Community appeared more interested.",
        "The word ‘safety’ can be misleading: no interviewed program guarantees a Match. Use ‘lower-ranked acceptable option’ and judge it on whether you would actually train there."
      ]
    },
    {
      "number": 10,
      "title": "Rank every acceptable option—but no unacceptable one",
      "introduction": "Adding a program lower on your list does not weaken the programs above it, but a Match to that program creates a binding commitment.",
      "bullets": [
        "If Sally ranks Programs A through G, the algorithm does not penalize her for listing seven programs or arbitrarily send her to #5.",
        "Programs F and G matter only if A through E cannot ultimately hold her.",
        "NRMP permits up to 20 unique program codes on the primary ROL and up to 20 across supplemental ROLs before additional rank fees apply; check the current fee rules for longer lists.",
        "Rank all programs where you interviewed and would genuinely accept training. More acceptable choices give the algorithm more possible outcomes.",
        "Do not rank a program merely because you interviewed there. If you match, the result is binding under the Match Participation Agreement.",
        "Review eligibility, visa sponsorship, appointment terms and any serious concerns before deciding that a program is acceptable."
      ],
      "links": [
        {
          "label": "NRMP — binding Match commitment",
          "url": "https://www.nrmp.org/help/item/what-happens-if-i-obtain-a-position-and-decide-not-to-accept-it-can-my-program-release-me-from-my-obligation-to-attend/"
        }
      ]
    },
    {
      "number": 11,
      "title": "Use the ‘Would I rather go unmatched?’ test",
      "introduction": "The bottom of your list should compare an imperfect program with being unmatched—not with your favorite program.",
      "bullets": [
        "Jamil is considering Hospital E after four programs he clearly prefers.",
        "The wrong question is whether Hospital E is as desirable as University A. Its position at the bottom already answers that.",
        "The useful question is: if my only outcomes were Hospital E or being unmatched, which would I choose?",
        "If Jamil would choose Hospital E, ranking it may be rational. If he would genuinely prefer to go unmatched and reapply, it should not appear on his list.",
        "Take the answer seriously. Consider the financial, immigration, licensing, specialty and career consequences of going unmatched, but do not rank a place where you cannot train in good faith.",
        "Only NRMP can grant a waiver from the binding commitment under limited circumstances; a program cannot privately release you from it."
      ]
    },
    {
      "number": 12,
      "title": "Decide what makes a program right for you",
      "introduction": "The algorithm is easier than the value judgment. Evaluate programs using criteria tied to your training, life and future—not someone else’s prestige hierarchy.",
      "bullets": [
        "Training quality—Case volume, patient diversity, clinical autonomy, faculty teaching, board preparation, procedures, research and fellowship exposure.",
        "Culture—Whether residents speak openly, appear supported, trust leadership and receive help when struggling; whether the environment feels collaborative or destructive.",
        "Lifestyle—Call and night-float structure, workload, vacation, commute, housing, cost of living and geographic fit.",
        "Career direction—For Sally, who wants Cardiology, relevant questions include fellowship presence and placement, cardiovascular research and reachable mentors.",
        "Different goal—Suraj may want community primary care, continuity and underserved practice. The program best for Sally may be a poor match for Suraj.",
        "Personal requirements—Partner employment, children, caregiving, community, safety, disability access, religious or cultural needs and proximity to support.",
        "IMG requirements—Visa sponsorship, ECFMG and appointment eligibility, graduation-year policies and realistic documentation timelines."
      ]
    },
    {
      "number": 13,
      "title": "Create criteria before rearranging names",
      "introduction": "Write your priorities before repeatedly dragging program names. A simple weighted matrix can expose your assumptions without making the decision for you.",
      "bullets": [
        "Illustrative weights—not recommendations—might be clinical training 25%, culture 20%, fellowship opportunities 15%, location 15%, workload 10%, research 5%, cost of living 5% and family considerations 5%.",
        "Sally might increase fellowship opportunities to 25%. John, who has children, might give location and family 30%. Jamil might make visa sponsorship a non-negotiable screen rather than a small weight.",
        "Score programs only after defining what each factor means. ‘Culture 5/5’ should be supported by observations, resident conversations and consistent evidence.",
        "Use the matrix to organize thinking, then review the whole decision. A weighted total can hide a single unacceptable condition or a powerful qualitative preference.",
        "Record what you learned from interviews while details are fresh. Separate verified program facts from impressions and rumors."
      ]
    },
    {
      "number": 14,
      "title": "Do not let prestige write your list",
      "introduction": "A Rank Order List is not a public ranking of hospital reputations; it is your preference for where to spend years of training and life.",
      "bullets": [
        "Suraj compares famous Program A with less-famous university-affiliated Program B.",
        "Program B has happier residents, strong fellowship placement, better mentorship, lower housing costs, family nearby and a culture where Suraj felt comfortable.",
        "If Suraj genuinely prefers B, B belongs above A. Name recognition is one factor, not an automatic decision rule.",
        "Ask whether a prestige advantage produces something relevant to your actual goals: training, mentorship, opportunities, network or fellowship—not merely an impressive answer to other people.",
        "Do not borrow the preferences of mentors, classmates or social media. Seek their information and perspective, then own the final order."
      ]
    },
    {
      "number": 15,
      "title": "Rank only interviewed programs and verify every code",
      "introduction": "The R3 entry must identify the exact program and track—not merely the institution you remember from interview day.",
      "bullets": [
        "Do not add a program where you did not interview. Programs do not rank applicants they did not interview, so no Match can occur.",
        "Jamil applied to 80 programs but interviewed at 11. A twelfth program he liked during application research does not become a viable ROL choice without an interview and reciprocal ranking.",
        "One institution may have categorical, preliminary, primary-care, advanced, physician, rural or other distinct tracks with different NRMP codes.",
        "Verify every code against the NRMP R3 Program Directory, the authoritative source. Do not rely solely on a program name, spreadsheet or old application-service entry.",
        "Confirm specialty, track, training start year and program type. An incorrect code can represent a materially different position.",
        "Review the final list for accidental duplicates, omissions and unintended ordering before certification."
      ]
    },
    {
      "number": 16,
      "title": "Save, certify and re-certify correctly",
      "introduction": "Entering programs is not the same as submitting a list for the Match. Certification is the controlling step.",
      "bullets": [
        "Build and save the ROL in the NRMP Registration, Ranking, and Results system, known as R3.",
        "Use ‘Certify List’ and the required R3 password to certify the list for use in the Match.",
        "Verify success in two ways: Applicant Status changes from ‘Ranking’ to ‘Certified,’ and NRMP sends confirmation to the primary email address on file.",
        "If Sally changes A → B → C into B → A → C after certification, saving is not enough. She must re-certify the changed version.",
        "Use the sequence: Save → Review → Certify or re-certify → Verify ‘Certified’ status → Preserve the confirmation.",
        "R3 does not retain previous ROL versions. Keep your own dated record if you need an audit trail.",
        "Only the certified version present by the deadline is used. NRMP will not add, delete or reorder programs after the deadline."
      ]
    },
    {
      "number": 17,
      "title": "Use the official 2027 Match deadlines",
      "introduction": "Put the dates in your calendar with time-zone conversion and finish early enough to recover from login, payment or internet problems.",
      "bullets": [
        "February 1, 2027 at 12:00 p.m. Eastern Time—Ranking opens. Applicants can build and edit ROLs in R3.",
        "March 3, 2027 at 9:00 p.m. Eastern Time—Rank Order List Certification Deadline.",
        "March 3 is also the late registration deadline, applicant withdrawal deadline and IMG deadline to meet applicable ECFMG verification requirements.",
        "March 15, 2027 at 10:00 a.m. Eastern Time—Applicant Match status becomes available and SOAP begins for eligible unmatched or partially matched applicants.",
        "March 19, 2027 at 12:00 p.m. Eastern Time—Match results become available on Match Day.",
        "Do not wait for the final minutes. Confirm the correct time in your location and check the live NRMP calendar again before acting."
      ],
      "links": [
        {
          "label": "NRMP — 2027 applicant calendar",
          "url": "https://www.nrmp.org/match-calendars/main-residency-applicants/"
        }
      ]
    },
    {
      "number": 18,
      "title": "Use the final strategy and certification checklist",
      "introduction": "Your job is not to outsmart the algorithm. Your job is to give it truthful preferences and a technically correct certified list.",
      "bullets": [
        "Bad strategy—John truly prefers Stanford → UCLA → University C → Community D but reverses the order because Community D seemed enthusiastic. The algorithm may match him exactly where he falsely claimed to prefer.",
        "Good strategy—Sally submits Stanford → UCLA → University C → Community D because that is her real order. The algorithm tries each in sequence and can still reach Community D if the higher choices cannot take her.",
        "Confirm #1 is the program you would choose if every program offered you a position today.",
        "Confirm every next program is preferred over every program below it, and every listed program is preferable to going unmatched.",
        "Include all acceptable interviewed programs; remove programs you would refuse and programs where you did not interview.",
        "Recheck training, culture, workload, geography, cost, family, career, fellowship, visa and appointment eligibility.",
        "Verify every NRMP program code, track and order in the R3 Program Directory.",
        "Certify rather than merely save. After any change, re-certify and confirm that R3 displays ‘Certified.’",
        "For 2027, complete the final certified list before March 3 at 9:00 p.m. Eastern Time.",
        "Final question—If I could not have this program, which would I choose next? Answer repeatedly until every acceptable program has its truthful place."
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$The applicant-proposing algorithm attempts your most preferred program first, then continues down your list only when a higher choice cannot ultimately hold you. A program may tentatively hold and later displace an applicant, but the released applicant continues to the next choice rather than losing every lower option.$conclusion$,
    $conclusion$That is why guessing where programs ranked you is not a strategy. Rank by genuine preference, include every interviewed program you would accept, exclude every program you would refuse and use the “Would I rather go unmatched?” test at the bottom.$conclusion$,
    $conclusion$Finally, treat the R3 mechanics as seriously as the preferences: verify the exact codes and tracks, save, certify, re-certify every change and confirm your status before the official deadline. Your ROL is not where you tell NRMP where you think you can get in. It is where you tell NRMP where you want to go.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "NRMP — rank your programs",
      "url": "https://www.nrmp.org/residency-applicants/rank-your-programs-main/"
    },
    {
      "label": "NRMP — how the matching algorithm works",
      "url": "https://www.nrmp.org/intro-to-the-match/how-matching-algorithm-works/"
    },
    {
      "label": "NRMP — 2027 Main Residency Match applicant calendar",
      "url": "https://www.nrmp.org/match-calendars/main-residency-applicants/"
    },
    {
      "label": "NRMP — which interviewed programs to rank",
      "url": "https://www.nrmp.org/help/item/should-i-rank-all-the-programs-at-which-i-interviewed/"
    },
    {
      "label": "NRMP — binding commitment and waivers",
      "url": "https://www.nrmp.org/help/item/what-happens-if-i-obtain-a-position-and-decide-not-to-accept-it-can-my-program-release-me-from-my-obligation-to-attend/"
    }
  ]
  $sources$::jsonb,
  'pasted-text.txt',
  '2026-08-26',
  true,
  '2026-08-26 20:30:00+01'
);

do $$
declare
  seeded_count integer;
  section_count integer;
  wrong_classification_count integer;
begin
  select count(*), min(jsonb_array_length(sections))
  into seeded_count, section_count
  from public.guidelines
  where slug = 'nrmp-rank-order-list-matching-algorithm-2027'
    and title = 'How to Build Your NRMP Rank Order List — and Understand How the Matching Algorithm Actually Works'
    and classification = 'residency-and-matching'
    and published;

  select count(*)
  into wrong_classification_count
  from public.guidelines
  where title = 'How to Build Your NRMP Rank Order List — and Understand How the Matching Algorithm Actually Works'
    and classification <> 'residency-and-matching';

  if seeded_count <> 1 or section_count <> 18 or wrong_classification_count <> 0 then
    raise exception 'Expected one published 18-section residency-only ROL guideline; found rows %, sections %, wrong classifications %', seeded_count, section_count, wrong_classification_count;
  end if;
end;
$$;

commit;
