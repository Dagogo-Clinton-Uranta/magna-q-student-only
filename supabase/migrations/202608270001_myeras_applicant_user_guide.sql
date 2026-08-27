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
  'myeras-applicant-user-guide-2027',
  '2027 MyERAS Applicant User Guide: A Clear, Step-by-Step Residency Application Walkthrough',
  'Build, check and submit your residency application',
  'Use the 2027 MyERAS portal with confidence—from registration and application entries to documents, program signals, certification, payment and follow-up after applying.',
  array[
    'Register with the correct current-season ERAS token and keep ERAS and Match registration separate.',
    'Complete personal, education, experience, scholarly work and specialty-specific sections accurately.',
    'Create and assign personal statements, letters and exam transcripts to the correct programs.',
    'Search programs by specialty, training type and visa support before spending application fees.',
    'Review signals and document assignments before applying because some choices become final.',
    'Proofread the full application before the one-time certify-and-submit action locks it.',
    'Track messages, document delivery and new exam scores throughout the application season.'
  ],
  'residency-and-matching',
  array[
    $preamble$The MyERAS application is more than a form. It is the system through which you build your residency application, manage supporting documents, select programs, send program signals and monitor your application after submission.$preamble$,
    $preamble$This article turns the official AAMC 2027 MyERAS Applicant User Guide into a simpler working sequence. Use it as a companion checklist, then confirm details in the live AAMC guide, your Designated Dean’s Office instructions and each program’s current requirements before you act.$preamble$,
    $preamble$ERAS transmits application material; it does not run the Match. Registering in MyERAS does not register you with the NRMP, Military Match, San Francisco Match, Urology Match or another matching service.$preamble$
  ],
  $sections$
  [
    {
      "number": 1,
      "title": "Know what MyERAS does—and what it does not do",
      "introduction": "Start with the system boundaries so that an ERAS task is not mistaken for a Match, school or program task.",
      "bullets": [
        "MyERAS is where you complete the common application, manage documents, find participating programs, assign signals and submit applications.",
        "Your Designated Dean’s Office issues your ERAS token and follows its own schedule for distributing materials and uploading or processing documents.",
        "The AAMC operates ERAS, but ERAS does not provide matching services. Complete any separate Match registration required for your pathway.",
        "Programs set their own eligibility, document, deadline and application-review requirements. MyERAS information does not replace the program’s official website or direct confirmation.",
        "IMG applicants should follow their Designated Dean’s Office and ECFMG instructions and independently confirm visa, certification and appointment requirements with programs."
      ],
      "links": [
        {
          "label": "AAMC — 2027 MyERAS Applicant User Guide",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
        }
      ]
    },
    {
      "number": 2,
      "title": "Register with the correct token and AAMC account",
      "introduction": "Registration connects the correct current-season token, applicant record and Designated Dean’s Office to your MyERAS application.",
      "bullets": [
        "Obtain a current-season ERAS token from your own Designated Dean’s Office. A token from a previous season cannot be used, and a token can be registered only once.",
        "Sign in with your existing AAMC account or create one, enter the token, accept the portal terms and review your medical-school information carefully.",
        "Do not use a token from another school or organization; the AAMC warns that doing so can prevent documents from being uploaded accurately.",
        "If you are offered an import during registration, review the source application and letters before confirming. You can also import later from the History tab.",
        "Keep your AAMC account credentials secure and make sure the email attached to your account is active."
      ],
      "links": [
        {
          "label": "AAMC — MyERAS registration",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/registration"
        }
      ]
    },
    {
      "number": 3,
      "title": "Use a draft-first workflow",
      "introduction": "A calm workflow makes omissions, accidental assignments and last-minute errors less likely.",
      "bullets": [
        "Create a private master document or spreadsheet for dates, titles, organization names, contacts, program requirements and assignment decisions.",
        "Draft longer responses in plain text, check character limits and paste the final version into MyERAS. Plain text reduces hidden formatting problems.",
        "Complete one application section at a time, save it and use the Dashboard to identify sections that remain incomplete or unsaved.",
        "Preview the application and CV repeatedly as a program would see them; do not wait until submission day to discover formatting or content problems.",
        "If you import prior-season information, treat it as a draft. Review, update and save every imported section before certification. Publications do not import into the 2027 application because the Scholarly Work section changed."
      ],
      "links": [
        {
          "label": "AAMC — importing prior application data",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/import-application-data"
        }
      ]
    },
    {
      "number": 4,
      "title": "Keep Personal Information accurate all season",
      "introduction": "Personal Information is operational: programs use it to contact you and MyERAS uses parts of it to connect documents and application records.",
      "bullets": [
        "Enter a reliable contact email, preferred phone number, current mailing address and permanent address, then keep them current throughout the season.",
        "Report work authorization based on your present status and answer Match participation questions for the services that apply to you.",
        "Enter the correct USMLE ID and, for DO applicants, NBOME ID if you plan to send the corresponding exam transcript.",
        "Review your name, date of birth and identifiers for consistency. A mismatch can interfere with retrieval of a USMLE transcript.",
        "Personal Information remains updateable after certification, but other application sections generally do not. Do not rely on that exception to postpone proofreading."
      ],
      "links": [
        {
          "label": "AAMC — Personal Information section",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/personal-information"
        }
      ]
    },
    {
      "number": 5,
      "title": "Enter education, training and credentials completely",
      "introduction": "Use the Education and Licenses & Certifications sections to give programs a complete, internally consistent record.",
      "bullets": [
        "Add each undergraduate and graduate institution that applies, with its degree and attendance dates, and complete at least the medical school from which you graduated or expect to graduate.",
        "Report any current or previous accredited residency, fellowship or AOA internship, regardless of how long you trained there.",
        "Answer the academic and professionalism interruption questions honestly. The AAMC states that this area is not intended to request health, disability or family-status information.",
        "Add applicable professional memberships, medical licenses, certifications and other requested credentials using accurate dates and status information.",
        "Compare every date and institution name with your CV, transcript, MSPE and other documents so the overall application does not contradict itself."
      ],
      "links": [
        {
          "label": "AAMC — Education section",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/education"
        }
      ]
    },
    {
      "number": 6,
      "title": "Use Experiences to show who you are",
      "introduction": "The Experiences section should help a reviewer understand your responsibilities, motivations and growth—not merely repeat a list of activities.",
      "bullets": [
        "Select and describe up to 10 experiences that best communicate what you did, what matters to you and what you would bring to residency.",
        "For each selected experience, provide the requested role, organization, dates, frequency, location and setting, then choose the best-fitting type, focus area and key characteristic where applicable.",
        "The official guide allows 750 characters for major activities, responsibilities and important context. Use concrete actions and outcomes instead of an inflated job description.",
        "Identify up to three experiences as most meaningful and use the additional 300 characters for each to explain why it mattered and how it influenced you.",
        "Use the optional impactful-experiences area only if it fits your circumstances. Be honest, protect patient privacy and do not feel pressured to manufacture adversity.",
        "Hobbies and interests have a 300-character limit. Specific details are usually more useful than a generic list."
      ],
      "links": [
        {
          "label": "AAMC — Experiences section",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/experience"
        }
      ]
    },
    {
      "number": 7,
      "title": "Enter Scholarly Work using the 2027 structure",
      "introduction": "The 2027 Scholarly Work section organizes academic output by work type and allows related outputs to be grouped into a coherent collection.",
      "bullets": [
        "Enter each item under the correct type: peer-reviewed journal article, peer-reviewed book chapter, peer-reviewed journal abstract, oral presentation or poster presentation.",
        "Record titles, authors and status accurately. Follow the requested author format, preserve the published author order and identify your own name correctly.",
        "Use only the status that is true—submitted, accepted or in press, or published—and include the relevant dates and available identifiers.",
        "For an oral or poster presentation delivered at multiple events, add the events to one scholarly-work entry instead of creating a misleading duplicate work.",
        "You may mark up to three items as most meaningful and group related entries into Scholarly Collections to show how a project produced several outputs.",
        "Preview the section as programs will see it and ask your Designated Dean’s Office when you are unsure how to label an item."
      ],
      "links": [
        {
          "label": "AAMC — 2027 Scholarly Work section",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/scholarly-work"
        }
      ]
    },
    {
      "number": 8,
      "title": "Create and assign personal statements deliberately",
      "introduction": "MyERAS allows multiple personal statements so you can use an appropriate version for a specialty or selected program.",
      "bullets": [
        "Give each statement a private, unmistakable title so you can distinguish versions; programs see the content, not your private title.",
        "The MyERAS limit is 28,000 characters, including spaces and punctuation, but readability and substance matter more than filling the limit.",
        "Draft in plain text, keep the final statement in your own voice and preview it to see its layout and page count as programs will see it.",
        "The AAMC permits AI tools for brainstorming, proofreading or editing, but the final submission must represent your own work. Copying another person’s language without credit can be treated as plagiarism.",
        "Assign exactly the intended statement to each program. A statement can be edited or newly assigned later, but a program is not guaranteed to review the update."
      ],
      "links": [
        {
          "label": "AAMC — MyERAS personal statements",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/personal-statement"
        }
      ]
    },
    {
      "number": 9,
      "title": "Request and assign Letters of Recommendation",
      "introduction": "A letter entry, an uploaded letter and a letter assigned to a program are three different stages; track all three.",
      "bullets": [
        "Create a separate entry for every letter, with the correct author, author email, specialty label, letter type, department-chair status and viewing-rights selection.",
        "Confirm the entry to generate its unique Letter Request ID, then send the individual request form to that author. Do not duplicate one request form for several authors.",
        "After confirmation, an incorrect entry cannot simply be edited; you may need to create a new entry. Review the details before confirming.",
        "The author or designee uploads through the Letter of Recommendation Portal. Follow up professionally and monitor the status until it says Uploaded.",
        "You may assign up to four uploaded letters to each program, but the program may require fewer. Once a letter is assigned to a program you have applied to, it cannot be replaced or removed.",
        "A later letter may be assigned if space remains, but the program is not guaranteed to review material received after its initial review."
      ],
      "links": [
        {
          "label": "AAMC — Letters of Recommendation",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/letters-recommendation"
        }
      ]
    },
    {
      "number": 10,
      "title": "Prepare transcripts and supporting documents",
      "introduction": "A document can exist in the system without being assigned to a particular program, so verify both availability and assignment.",
      "bullets": [
        "Coordinate the MSPE, medical-school transcript and other school-provided documents with your Designated Dean’s Office and its processing schedule.",
        "For USMLE scores, first authorize and pay for the transcript in the FSMB USMLE portal, then initiate retrieval in MyERAS, verify the USMLE ID and select Get Scores.",
        "Assign the USMLE or COMLEX-USA transcript only where appropriate and review each program’s requirements. Once an exam transcript is assigned to an applied program, it cannot be unassigned.",
        "IMG applicants should also monitor the ECFMG Status Report and other documents handled through the IMG process.",
        "Use transcript-status and assignment reports to confirm delivery. If new USMLE scores are released after applying, use Resend My Scores; the update goes to every program that previously received the transcript, not a selected subset.",
        "Use the Assignments Checklist to find programs missing a personal statement, photo, transcript, MSPE or letters before payment."
      ],
      "links": [
        {
          "label": "AAMC — USMLE transcript workflow",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/usmle-transcript"
        },
        {
          "label": "AAMC — Assignments Checklist",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/assignments-checklist"
        }
      ]
    },
    {
      "number": 11,
      "title": "Complete specialty-specific questions before applying",
      "introduction": "For 2027, applicants to Anesthesiology, Neurological Surgery and Plastic Surgery–Integrated must answer specialty-specific questions before applying in those specialties.",
      "bullets": [
        "Open Answer Questions for the relevant specialty, draft your responses in plain text and answer every required question before saving.",
        "Use a specific example, explain your own decisions or actions and include what you learned; do not reuse one vague response for several different prompts.",
        "Before certification, saved responses can be edited or deleted. After certification, already-submitted responses cannot be edited or deleted.",
        "If you certify before answering questions for another covered specialty, MyERAS allows you to add and submit those remaining responses later—but once submitted they are final.",
        "Programs in a specialty can view only the responses for that specialty."
      ],
      "links": [
        {
          "label": "AAMC — 2027 specialty questions",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/specialty-questions"
        }
      ]
    },
    {
      "number": 12,
      "title": "Research and save programs before you apply",
      "introduction": "Saving a program creates a working list; it does not submit an application or guarantee that you meet the program’s requirements.",
      "bullets": [
        "Search by specialty or ACGME accreditation ID, then narrow by location, training type and displayed visa support such as J-1, H-1B or F-1.",
        "Open the program details to review tracks, application requirements, contact information, signaling participation and any additional information the program chose to provide.",
        "Confirm requirements and deadlines on the program’s current website or with the program directly. Programs are not required to provide every detail inside MyERAS, and status can change.",
        "Select the correct training type before adding a program to Saved Programs. Confirming it as saved still does not mean you have applied.",
        "Before paying, recheck eligibility, track, accreditation ID, visa support and whether the program is actively accepting applications. ERAS application fees are not refunded."
      ],
      "links": [
        {
          "label": "AAMC — searching for programs in MyERAS",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/search-programs"
        }
      ]
    },
    {
      "number": 13,
      "title": "Finalize signals and document assignments",
      "introduction": "Use Saved Programs as the staging area where you can still correct most signal and document choices before sending an application.",
      "bullets": [
        "A participating specialty may use one signal tier or two tiers—gold and silver—and each specialty has a fixed allocation.",
        "A signal assigned to a saved program can still be removed or changed. It becomes final for that program when you apply.",
        "If you withdraw from a program you signaled, the signal does not return for reassignment.",
        "Assign the intended personal statement, letters and other applicant-controlled documents to every program and confirm the program’s own letter-count rules.",
        "Document assignments can be changed while the program is only saved, but several assignments become fixed after application. Review the Assignments Checklist and Assignments Report before paying.",
        "Treat program signals as a separate strategy decision; they do not replace eligibility, complete documents or a strong application."
      ],
      "links": [
        {
          "label": "AAMC — Saved Programs, signals and assignments",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/saved-programs"
        }
      ]
    },
    {
      "number": 14,
      "title": "Certify only after a full final review",
      "introduction": "Certify and Submit is a one-time, irreversible action that locks the common application so every program receives the same version.",
      "bullets": [
        "Complete and save every required field, then use the Dashboard to find sections that are incomplete or unsaved.",
        "Preview the entire application and CV. Check names, dates, chronology, institutions, grammar, spelling, character limits and consistency with your supporting documents.",
        "Ask a trusted advisor to review a preview, but verify every correction yourself. MyERAS does not provide spelling or grammar checking.",
        "Confirm any permission allowing your Designated Dean’s Office to view the application if that access is needed.",
        "After certification, you cannot revise the common application outside Personal Information; the AAMC states there are no exceptions. Do not certify merely to explore the payment screen.",
        "Certification is not the same as applying. You must certify before you can apply, then separately select programs, review the invoice, confirm signals and complete payment."
      ],
      "links": [
        {
          "label": "AAMC — Certify and Submit",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/certify-and-submit"
        }
      ]
    },
    {
      "number": 15,
      "title": "Apply carefully and monitor what happens next",
      "introduction": "Payment sends the application, but your responsibilities continue through document processing, program communication and later score updates.",
      "bullets": [
        "Select the intended programs, use Apply/Preview Invoice, review signals one last time and confirm the complete cost summary before paying.",
        "Save the receipt and review Programs Applied To, Payment History, Assignments Report and transcript request reports for the actual post-payment status.",
        "Check the MyERAS Message Center and your active contact email regularly. Programs may communicate through MyERAS, email, telephone or regular mail.",
        "Respond professionally and follow each program’s communication instructions. Do not assume that silence means a document was received or an application was reviewed.",
        "Track late-arriving letters, MSPEs, transcripts and new exam scores. A document may become available after application, but a program is not guaranteed to review a later update.",
        "Keep Personal Information current and contact the AAMC Support Center, FSMB, your Designated Dean’s Office, ECFMG or the program itself according to which organization controls the issue."
      ],
      "links": [
        {
          "label": "AAMC — communicating with programs",
          "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/communicating-programs"
        }
      ]
    },
    {
      "number": 16,
      "title": "Use the final MyERAS checklist",
      "introduction": "Run this compact audit before certification and again before paying for each group of programs.",
      "bullets": [
        "Registration—Correct current-season token, correct AAMC account, separate Match registration completed where required.",
        "Application—Every required section saved; dates, names and identifiers consistent; imported information reviewed; full PDF and CV proofread.",
        "Content—Experiences and scholarly work accurate; personal statement is your own; required specialty questions completed.",
        "Documents—MSPE and transcript status checked; correct exam IDs; each personal statement and letter assigned to the intended programs.",
        "Programs—Correct specialty, track and accreditation ID; program eligibility and deadline verified; visa support confirmed where relevant.",
        "Signals—Correct tier and program; no signal still sitting on the wrong saved program; final choices reviewed before application.",
        "Submission—Common application certified only after the final review; invoice and fees checked; payment receipt saved.",
        "Follow-up—Email and Message Center monitored; delivery reports checked; later documents or scores resent when appropriate."
      ]
    }
  ]
  $sections$::jsonb,
  array[
    $conclusion$A successful MyERAS submission is built in layers: register correctly, complete and save every application section, prepare documents, research programs, assign materials and signals, preview the complete application and only then certify and apply.$conclusion$,
    $conclusion$The two most important technical distinctions are simple. Saving a program is not applying to it, and certifying the common application is not the same as paying to send it. Certification locks most application content; applying makes several program-level assignments final.$conclusion$,
    $conclusion$Use this walkthrough to stay organized, but let the official 2027 AAMC guide, your Designated Dean’s Office and each program’s current instructions control. Requirements and program status can change during the season, so verify before every irreversible action.$conclusion$
  ],
  null,
  $sources$
  [
    {
      "label": "AAMC — 2027 MyERAS Applicant User Guide",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication/2027-myeras-applicant-user-guide"
    },
    {
      "label": "AAMC — MyERAS registration",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/registration"
    },
    {
      "label": "AAMC — 2027 Scholarly Work section",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/scholarly-work"
    },
    {
      "label": "AAMC — Letters of Recommendation",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/letters-recommendation"
    },
    {
      "label": "AAMC — Certify and Submit",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/certify-and-submit"
    },
    {
      "label": "AAMC — searching and saving programs",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/saved-programs"
    },
    {
      "label": "AAMC — Assignments Checklist",
      "url": "https://students-residents.aamc.org/applying-residencies-eras/publication-chapters/assignments-checklist"
    }
  ]
  $sources$::jsonb,
  '2027 MyERAS Applicant User Guide (AAMC web publication)',
  '2026-08-27',
  true,
  '2026-08-27 12:00:00+01'
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
  where slug = 'myeras-applicant-user-guide-2027'
    and title = '2027 MyERAS Applicant User Guide: A Clear, Step-by-Step Residency Application Walkthrough'
    and classification = 'residency-and-matching'
    and published;

  select count(*)
  into wrong_classification_count
  from public.guidelines
  where slug = 'myeras-applicant-user-guide-2027'
    and classification in ('usmle-step-1', 'usmle-step-2-ck', 'usmle-step-3');

  if seeded_count <> 1 or section_count <> 16 or wrong_classification_count <> 0 then
    raise exception 'Expected one published 16-section residency-only MyERAS guideline; found rows %, sections %, USMLE-classified rows %', seeded_count, section_count, wrong_classification_count;
  end if;
end;
$$;

commit;
