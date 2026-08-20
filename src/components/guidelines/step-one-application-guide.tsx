import Image from "next/image";

const currentSteps = [
  {
    title: "Confirm that your medical school is eligible",
    points: [
      "Search for your school in the World Directory of Medical Schools (WDOMS).",
      "Open the school record and select the Sponsor Notes tab.",
      "Confirm that an ECFMG Sponsor Note is present and that its graduation years cover your status. Current students should see “Current”; graduates must confirm that their graduation year is included.",
      "If the school is missing or has no ECFMG Sponsor Note, contact an authorized official at your medical school. Only school officials—not students or graduates—can request an ECFMG Sponsor Note review.",
    ],
    links: [
      ["Search the World Directory", "https://search.wdoms.org/"],
      [
        "Read the official Sponsor Note guidance",
        "https://www.wdoms.org/resources/sponsor-notes.html",
      ],
    ],
  },
  {
    title: "Establish your MyIntealth account",
    points: [
      "Create a MyIntealth Applicant Portal account. The former IWA and OASIS services have been replaced.",
      "Enter your name exactly as it appears on your current, unexpired passport, together with your date of birth, address, and medical-school information.",
      "Complete the identity-verification steps shown in MyIntealth. You will receive one permanent MyIntealth ID when the account is fully established.",
      "If you previously used ECFMG services, disclose that history so your former record can be connected. Do not create a second identity record.",
    ],
    links: [
      ["Access MyIntealth", "https://myintealth.ecfmg.org/"],
      [
        "MyIntealth applicant guide",
        "https://portal.ecfmg.org/myintealth/applicantguide.html",
      ],
    ],
  },
  {
    title: "Submit your Application for ECFMG Certification",
    points: [
      "After account and identity verification, open the Application for ECFMG Certification in MyIntealth.",
      "Confirm your personal and medical-education details before submitting. Graduates must also provide the required diploma, transcript, and any transfer-credit documents.",
      "Pay only the fee displayed in the official portal. The fee page currently lists separate charges for MyIntealth account establishment, ECFMG certification, and credential verification; fees can change.",
      "Monitor My Cases in MyIntealth and respond promptly if ECFMG requests documents or corrections.",
    ],
    links: [
      [
        "Application for ECFMG Certification",
        "https://www.ecfmg.org/2026ib/application-ecfmg-certification.html",
      ],
      ["Current ECFMG fees", "https://myintealth.ecfmg.org/fees/"],
    ],
  },
  {
    title: "Register for Step 1 through FSMB",
    points: [
      "Since January 12, 2026, FSMB—not ECFMG/IWA—provides USMLE Step exam registration for international medical students and graduates.",
      "Use the FSMB USMLE portal and choose Step 1. FSMB issues a USMLE ID when a new IMG registers for a first Step exam; an existing USMLE ID remains valid.",
      "Choose an eligibility period you can realistically use and complete every identity, eligibility, and payment instruction in the current portal.",
      "The official USMLE page currently lists a $695 application fee for 2026 and 2027. Verify the displayed amount before paying with an internationally enabled card.",
    ],
    links: [
      [
        "Apply for Step 1 through USMLE/FSMB",
        "https://www.usmle.org/step-exams",
      ],
      [
        "Read the current USMLE Bulletin",
        "https://www.usmle.org/bulletin-information",
      ],
    ],
  },
  {
    title: "Complete school and credential verification",
    points: [
      "Follow the exact verification instructions generated for your application. The required process depends on whether you are a student or graduate and how your school exchanges records with ECFMG.",
      "If your school participates in an electronic verification service, an authorized school official can usually respond electronically.",
      "Do not mail a legacy Form 183 or another paper form unless the current portal specifically instructs you to do so.",
      "If a school signature or seal is requested, use an official recognized by ECFMG and follow the document instructions exactly.",
    ],
    links: [
      [
        "Medical education credential requirements",
        "https://www.ecfmg.org/2026ib/credentials-requirements.html",
      ],
    ],
  },
  {
    title: "Receive your permit and schedule with Prometric",
    points: [
      "Wait until your application and eligibility checks are complete and your scheduling permit has been issued.",
      "Check every detail on the permit, then use the official scheduling link to select a Prometric center and date within your eligibility period.",
      "Keep copies of your confirmation, permit, payment records, and later your score report.",
      "Before exam day, confirm the current identification requirements and appointment-change fees in the USMLE Bulletin.",
    ],
    links: [
      [
        "USMLE applying and scheduling guidance",
        "https://www.usmle.org/bulletin-information/applying-scheduling",
      ],
    ],
  },
] as const;

const legacyScreenshots: readonly {
  src: string;
  alt: string;
  caption: string;
  current?: boolean;
}[] = [
  {
    src: "/images/guidelines/step-1/usmle-1-1.png",
    alt: "Older World Directory medical school search screen",
    caption: "Search WDOMS for your medical school.",
    current: true,
  },
  {
    src: "/images/guidelines/step-1/usmle-1-2.png",
    alt: "Older World Directory Sponsor Notes tab",
    caption:
      "Open Sponsor Notes and confirm the ECFMG note and eligible years.",
    current: true,
  },
  {
    src: "/images/guidelines/step-1/usmle-1-3.png",
    alt: "Retired ECFMG website showing the IWA link",
    caption:
      "Legacy reference: IWA is retired; use MyIntealth and FSMB instead.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-4.png",
    alt: "Retired IWA request USMLE identification link",
    caption:
      "Legacy reference: do not request a new USMLE ID through this old IWA screen.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-5.png",
    alt: "Retired ECFMG biographic information form",
    caption:
      "Legacy reference: personal details were entered here in the former system.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-6.png",
    alt: "Retired IWA sign-in and identification request screen",
    caption: "Legacy reference: former IWA login and ID-request options.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-7.png",
    alt: "Retired IWA application for ECFMG certification link",
    caption:
      "Legacy reference: ECFMG Certification applications now use MyIntealth.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-8.png",
    alt: "Older NotaryCam Form 186 selection screen",
    caption: "Legacy reference: former NotaryCam Form 186 selection screen.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-9.png",
    alt: "Older NotaryCam document upload screen",
    caption: "Legacy reference: former Form 186 and passport upload screen.",
  },
  {
    src: "/images/guidelines/step-1/usmle-1-10.png",
    alt: "Older NotaryCam account registration form",
    caption:
      "Legacy reference: former NotaryCam account and personal-details form.",
  },
];

export function StepOneApplicationGuide() {
  return (
    <section className="mt-10 border border-brand-200 bg-white p-5 sm:p-8">
      <p className="eyebrow">Application walkthrough</p>
      <h2 className="mt-3 text-2xl font-normal tracking-[0.02em] text-ink sm:text-3xl">
        Step-by-step guide to applying for USMLE Step 1
      </h2>
      <p className="mt-4 max-w-4xl leading-7 text-muted">
        International medical students and graduates need both an eligible ECFMG
        record and a USMLE exam application. The systems are separate, so
        complete them in the order below.
      </p>
      <div className="mt-5 border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        <strong>Important 2026 update:</strong> IWA screenshots 3–10 below show
        the former process. Since January 12, 2026, use MyIntealth for ECFMG
        Certification and FSMB for USMLE exam registration. Never submit a
        legacy form unless your current portal explicitly asks for it.
      </div>

      <ol className="mt-8 space-y-6">
        {currentSteps.map((step, index) => (
          <li
            key={step.title}
            className="border border-line bg-field p-5 sm:p-6"
          >
            <div className="flex items-start gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center bg-black text-sm font-bold text-white">
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-ink">{step.title}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-body">
                  {step.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span aria-hidden="true" className="text-brand-700">
                        •
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {step.links.map(([label, href]) => (
                    <a
                      key={href}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-bold text-brand-800 underline underline-offset-2"
                    >
                      {label} ↗
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <section className="mt-10">
        <h3 className="text-xl font-bold text-ink">Visual reference</h3>
        <p className="mt-2 max-w-4xl text-sm leading-6 text-muted">
          The first two images still illustrate where to check school
          eligibility. The remaining images are retained only to help returning
          applicants recognize the retired screens. All images use the same
          display frame; the originals are preserved so official text is not
          changed by generative sharpening.
        </p>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          {legacyScreenshots.map((image, index) => (
            <figure key={image.src} className="border border-line bg-white p-3">
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain"
                />
              </div>
              <figcaption className="mt-3 flex gap-2 text-sm leading-5 text-body">
                <span
                  className={`shrink-0 font-bold ${image.current ? "text-green-700" : "text-amber-700"}`}
                >
                  {index + 1}.
                </span>
                <span>{image.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-line pt-8">
        <h3 className="text-xl font-bold text-ink">Common questions</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <article className="border border-line p-5">
            <h4 className="font-bold">
              How long do I have after passing my first exam?
            </h4>
            <p className="mt-3 text-sm leading-6 text-body">
              ECFMG currently requires IMGs to satisfy all examination
              requirements for certification within seven years of the first
              passing performance. This includes an accepted Pathway. Track the
              exact deadline in MyIntealth because ECFMG does not send deadline
              reminders.
            </p>
            <a
              href="https://www.ecfmg.org/2026ib/time-limit-complete-exams.html"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-bold text-brand-800 underline"
            >
              Read the seven-year policy ↗
            </a>
          </article>
          <article className="border border-line p-5">
            <h4 className="font-bold">
              What if my passport and medical degree show different names?
            </h4>
            <p className="mt-3 text-sm leading-6 text-body">
              Your MyIntealth and FSMB records should match your current,
              unexpired passport exactly. If a diploma or transcript uses a
              different name, submit acceptable name-verification documentation
              with your ECFMG application. A properly completed letter from an
              authorized school official may be considered when the listed
              documents are unavailable.
            </p>
            <a
              href="https://www.ecfmg.org/2026ib/name-diploma-transcripts.html"
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm font-bold text-brand-800 underline"
            >
              Review accepted name evidence ↗
            </a>
          </article>
        </div>
      </section>
    </section>
  );
}
