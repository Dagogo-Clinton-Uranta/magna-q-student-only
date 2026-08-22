import {
  residencyMatchMilestones,
  type ResidencyMatchMilestone,
} from "@/lib/guidelines/residency-match";

export type Guide = {
  slug: "step-1" | "step-2-ck" | "step-3" | "residency-match";
  eyebrow: string;
  title: string;
  summary: string;
  examAtAGlance: { label: string; value: string }[];
  timeline?: { stage: string; timing: string; detail: string }[];
  residencyTimeline?: ResidencyMatchMilestone[];
  whatToExpect: string[];
  gotchas: string[];
  sources: { label: string; href: string }[];
};

export const guides: Guide[] = [
  {
    slug: "step-1",
    eyebrow: "Foundation science",
    title: "USMLE Step 1: build the foundation",
    summary:
      "Step 1 asks whether you can apply foundational science to health, disease and therapy. It is pass/fail, but it is not a low-stakes exam: a failed attempt is permanently reported, so choose a date based on readiness rather than a fixed calendar target.",
    examAtAGlance: [
      { label: "Result", value: "Pass / Fail" },
      { label: "Exam day", value: "1 day · about 8 hours" },
      {
        label: "Format from May 14, 2026",
        value: "14 × 30-minute blocks · up to 280 items",
      },
      { label: "Where", value: "Prometric test center" },
    ],
    timeline: [
      {
        stage: "Learn the landscape",
        timing: "Early medical school",
        detail:
          "Confirm your school is eligible, create the required ECFMG/Intealth and FSMB accounts if you are an IMG, and read the current Bulletin of Information.",
      },
      {
        stage: "Build core knowledge",
        timing: "Pre-clinical curriculum",
        detail:
          "Learn systems and foundational disciplines together; do not rely on a question bank alone to build first-pass understanding.",
      },
      {
        stage: "Choose a realistic window",
        timing: "Usually after core sciences",
        detail:
          "Select a three-month eligibility period only when your school schedule and readiness plan support it.",
      },
      {
        stage: "Apply → permit → schedule",
        timing: "Before your target date",
        detail:
          "Apply through the current registration entity, wait for approval and your scheduling permit, then book with Prometric promptly.",
      },
      {
        stage: "Test and document",
        timing: "Exam day onward",
        detail:
          "Bring acceptable identification and your permit. Keep the score report and test-date record for future credentialing.",
      },
    ],
    whatToExpect: [
      "Integrated organ-system questions that apply basic science in clinical contexts.",
      "A one-day, computer-based exam. From May 2026, the delivery software uses shorter 30-minute blocks.",
      "Content includes foundational science, diagnosis, communication, population health and systems-based thinking.",
    ],
    gotchas: [
      "Do not schedule before you have a permit; Prometric dates are first-come, first-served.",
      "Your eligibility period is not your appointment. You still must select an actual Prometric date.",
      "Changes near an appointment can carry Prometric fees. Read the current Bulletin before making changes.",
      "Use only the official content outline and practice software to understand the current format; it can change.",
    ],
    sources: [
      {
        label: "USMLE Step 1 content and format",
        href: "https://www.usmle.org/step-exams/step-1/step-1-exam-content",
      },
      {
        label: "USMLE applying and scheduling",
        href: "https://www.usmle.org/bulletin-information/applying-scheduling",
      },
      {
        label: "ECFMG eligibility for examination (IMGs)",
        href: "https://ecfmg.org/certification/eligibility-for-examination.html",
      },
      {
        label: "MyIntealth applicant portal guide",
        href: "https://portal.ecfmg.org/myintealth/applicantguide.html",
      },
      {
        label: "2026 USMLE service transition for IMGs",
        href: "https://www.usmle.org/2026-bulletin-information-addendum",
      },
    ],
  },
  {
    slug: "step-2-ck",
    eyebrow: "Clinical knowledge",
    title: "USMLE Step 2 CK: apply medicine to patient care",
    summary:
      "Step 2 CK tests how you apply clinical knowledge to supervised patient care, with emphasis on prevention, diagnosis and management. It is numerically scored and often timed around clinical rotations and the residency-application year.",
    examAtAGlance: [
      { label: "Result", value: "Three-digit score" },
      { label: "Exam day", value: "1 day · about 9 hours" },
      {
        label: "Format from May 7, 2026",
        value: "16 × 30-minute blocks · up to 318 items",
      },
      { label: "Where", value: "Prometric test center" },
    ],
    timeline: [
      {
        stage: "Start during clerkships",
        timing: "Clinical rotations",
        detail:
          "Turn patient encounters into structured review. Track gaps by specialty and clinical task, not only by question-bank percentage.",
      },
      {
        stage: "Plan backward from your goal",
        timing: "Months before testing",
        detail:
          "If applying to residency, build in time for score reporting and ECFMG certification requirements. Do not assume every cycle uses the same dates.",
      },
      {
        stage: "Select eligibility period",
        timing: "When your study leave is protected",
        detail:
          "Choose a three-month window you can genuinely use, then complete the application and school verification steps.",
      },
      {
        stage: "Book and rehearse",
        timing: "After permit",
        detail:
          "Book Prometric early and use the official interactive testing experience so the exam interface is not new on test day.",
      },
      {
        stage: "Use the result strategically",
        timing: "After score release",
        detail:
          "Retain official records and discuss an application timeline with your school/advisor, especially if you are an IMG.",
      },
    ],
    whatToExpect: [
      "Clinical vignettes that assess diagnosis, management, prevention and patient safety.",
      "A long one-day test; from May 2026 it uses sixteen 30-minute blocks, with at least 55 minutes of break time.",
      "Questions span ambulatory, inpatient and emergency presentations across the lifespan.",
    ],
    gotchas: [
      "Step 1 and Step 2 CK can be taken in either order, but your school may have its own sequencing rules.",
      "A calendar date is not a readiness score. Avoid an application deadline forcing an unsafe test date.",
      "For IMGs, passing Step 1 and Step 2 CK is necessary but not by itself the whole ECFMG certification process.",
      "Do not confuse Step 2 CK with the discontinued Step 2 CS exam.",
    ],
    sources: [
      {
        label: "USMLE Step 2 CK content and format",
        href: "https://www.usmle.org/exam-resources/step-2-ck-materials/step-2-ck-content-outline-specifications",
      },
      {
        label: "USMLE applying and scheduling",
        href: "https://www.usmle.org/bulletin-information/applying-scheduling",
      },
      {
        label: "2027 ECFMG certification pathways",
        href: "https://portal.ecfmg.org/certification-pathways/",
      },
    ],
  },
  {
    slug: "step-3",
    eyebrow: "Independent practice",
    title: "USMLE Step 3: show safe independent decision-making",
    summary:
      "Step 3 is a two-day exam for physicians moving toward unsupervised practice. For IMGs, a valid ECFMG Certificate plus passed Step 1 and Step 2 CK are required before you can apply.",
    examAtAGlance: [
      { label: "Result", value: "Three-digit score" },
      { label: "Exam days", value: "2 days · about 7 + 9 hours" },
      { label: "Format", value: "MCQs + 13–14 CCS cases" },
      { label: "Scheduling", value: "Days may be consecutive or separate" },
    ],
    timeline: [
      {
        stage: "Confirm eligibility first",
        timing: "Before applying",
        detail:
          "Pass Step 1 and Step 2 CK. IMGs also need valid ECFMG Certification; applicants cannot apply before its issue date.",
      },
      {
        stage: "Choose two testing days",
        timing: "During residency planning",
        detail:
          "Select a three-month eligibility period. The two Step 3 days can be consecutive or non-consecutive.",
      },
      {
        stage: "Apply → permit → book",
        timing: "After eligibility is verified",
        detail:
          "Apply through FSMB, receive your permit, and schedule each test day with Prometric.",
      },
      {
        stage: "Prepare two different skills",
        timing: "Before test days",
        detail:
          "Day 1 emphasizes foundations of independent practice; Day 2 combines clinical management MCQs with computer-based case simulations (CCS).",
      },
      {
        stage: "Preserve your records",
        timing: "After testing",
        detail:
          "Score reports are time-limited in the portal; download and store a copy.",
      },
    ],
    whatToExpect: [
      "Day 1: 232 MCQs across 12 short blocks, with independent-practice foundations.",
      "Day 2: 180 MCQs plus 13–14 computer-based case simulations (CCS).",
      "CCS evaluates diagnosis, orders, treatment, monitoring and timing as simulated patient conditions change.",
    ],
    gotchas: [
      "Do not apply before ECFMG Certification is issued if you are an IMG; the portal will not permit it.",
      "Practice CCS mechanics, not just clinical facts. The official guidance says unfamiliarity with the format puts examinees at a disadvantage.",
      "The application fee and eligibility period are not transferable. Check current change and extension rules before paying.",
      "Bring permit and acceptable ID for both testing days.",
    ],
    sources: [
      {
        label: "FSMB Step 3 eligibility and application",
        href: "https://www.fsmb.org/step-3/step-3-information/",
      },
      {
        label: "USMLE Step 3 exam content",
        href: "https://www.usmle.org/step-exams/step-3/step-3-exam-content",
      },
      {
        label: "USMLE CCS guide",
        href: "https://www.usmle.org/exam-resources/step-3-materials/computer-based-case-simulations",
      },
    ],
  },
  {
    slug: "residency-match",
    eyebrow: "Residency application",
    title: "The 2027 residency Match: from application to Match Day",
    summary:
      "The Match is not your residency application. You apply and interview through the service required by each program, then separately register with NRMP’s R3 system and certify a rank-order list. The dates below come from the official 2027 calendar supplied with this project.",
    examAtAGlance: [
      { label: "Register", value: "NRMP R3 + program’s application service" },
      { label: "Rank deadline", value: "Mar 3, 2027 · 9 p.m. ET" },
      { label: "Match Week", value: "Mar 15–19, 2027" },
      { label: "Match Day", value: "Mar 19, 2027 · noon ET" },
    ],
    residencyTimeline: residencyMatchMilestones,
    whatToExpect: [
      "You apply to programs, interview, then rank only programs where you would be willing to train.",
      "Programs rank interviewed applicants; NRMP’s algorithm uses both sets of ranked preferences.",
      "A certified rank list creates a binding commitment if you match. Rank by your actual preference, not by where you guess you are competitive.",
    ],
    gotchas: [
      "ERAS or another program application service is separate from NRMP registration.",
      "Certification—not merely saving a list—is required by the deadline.",
      "An IMG must meet ECFMG verification requirements by the published deadline to participate.",
      "SOAP eligibility and the list of available programs are determined in NRMP R3; do not rely on unofficial lists.",
    ],
    sources: [
      {
        label: "NRMP 2027 applicant calendar",
        href: "https://www.nrmp.org/match-calendars/main-residency-applicants/",
      },
      {
        label: "NRMP guide to the Main Residency Match",
        href: "https://www.nrmp.org/residency-applicants/",
      },
      {
        label: "NRMP rank-order-list guidance",
        href: "https://www.nrmp.org/residency-applicants/rank-your-programs-main/",
      },
    ],
  },
];

export function getGuide(slug: string) {
  return guides.find((guide) => guide.slug === slug);
}
