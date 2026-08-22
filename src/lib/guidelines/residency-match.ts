export type ResidencyMatchMilestone = {
  date: string;
  shortDate: string;
  time: string;
  stage: string;
  phase: "Prepare" | "Register" | "Rank" | "Match Week";
  summary: string;
  whyItMatters: string;
  actions: string[];
};

export const residencyMatchMilestones: ResidencyMatchMilestone[] = [
  {
    date: "2026-05-01",
    shortDate: "May 1",
    time: "12 p.m. ET",
    stage: "Program registration opens",
    phase: "Prepare",
    summary:
      "Programs and institutions can begin activating and updating their entries for the 2027 Match.",
    whyItMatters:
      "The NRMP Program Directory starts changing as programs confirm their participation, giving you an early foundation for research.",
    actions: [
      "Start a program shortlist and revisit it as directory entries are updated.",
      "Confirm the application service and requirements used by every program you are considering.",
      "Meet with your school or advisor to map documents, exams, letters, and specialty-specific requirements.",
    ],
  },
  {
    date: "2026-09-15",
    shortDate: "Sep 15",
    time: "12 p.m. ET",
    stage: "Applicant registration opens",
    phase: "Register",
    summary:
      "Applicant and medical school registration opens in the NRMP Registration, Ranking, and Results (R3) system.",
    whyItMatters:
      "NRMP registration is separate from applying to programs. You need both the Match registration and each program's required application process.",
    actions: [
      "Create or access your NRMP account and register for the 2027 Main Residency Match.",
      "Check that your legal name and school information match your official records.",
      "Save your confirmation and continue submitting program applications through the required service.",
    ],
  },
  {
    date: "2026-10-01",
    shortDate: "Oct 1",
    time: "8 a.m. ET",
    stage: "School roster uploads begin",
    phase: "Register",
    summary:
      "Medical schools can begin uploading rising seniors into the R3 system.",
    whyItMatters:
      "Your school record is part of the later eligibility and graduation-credential verification workflow.",
    actions: [
      "Confirm that your medical school has your current identifying and graduation information.",
      "Ask your school how and when it handles NRMP verification questions.",
      "Resolve name, graduation-date, or student-status discrepancies early.",
    ],
  },
  {
    date: "2027-01-29",
    shortDate: "Jan 29",
    time: "11:59 p.m. ET",
    stage: "Standard registration deadline",
    phase: "Register",
    summary:
      "Standard applicant registration ends. NRMP applies an additional $50 fee to registrations after this deadline.",
    whyItMatters:
      "Waiting costs more and leaves less time to fix an account, payment, or participation problem before ranking closes.",
    actions: [
      "Finish Match registration and payment before the deadline.",
      "Log back into R3 and verify that your applicant status reflects successful registration.",
      "Contact NRMP promptly if your registration or school association looks incorrect.",
    ],
  },
  {
    date: "2027-02-01",
    shortDate: "Feb 1",
    time: "12 p.m. ET",
    stage: "Ranking opens",
    phase: "Rank",
    summary:
      "Ranking opens for applicants and programs, and schools begin verifying graduation credentials.",
    whyItMatters:
      "You can now build the Rank Order List that the matching algorithm will use. Saved and certified are not the same status.",
    actions: [
      "Enter only programs where you would be willing to train, in your genuine preference order.",
      "Review program codes, tracks, and advanced/preliminary arrangements carefully.",
      "Discuss your draft list with a trusted advisor, then leave time for a final accuracy check.",
    ],
  },
  {
    date: "2027-03-03",
    shortDate: "Mar 3",
    time: "9 p.m. ET",
    stage: "Rank list certification deadline",
    phase: "Rank",
    summary:
      "Rank certification, late Match/SOAP registration, applicant withdrawal, and required verification windows close.",
    whyItMatters:
      "An uncertified list cannot be used in the Match. This is also the IMG deadline to meet ECFMG verification requirements.",
    actions: [
      "Make your final edits, certify the list, and confirm that R3 shows it as certified.",
      "Save proof of certification and avoid last-minute browser, payment, or account problems.",
      "If you are an IMG, confirm that your ECFMG verification requirement is satisfied in time.",
      "If needed, complete withdrawal or late Match/SOAP registration before 9 p.m. ET.",
    ],
  },
  {
    date: "2027-03-15",
    shortDate: "Mar 15",
    time: "10 a.m. ET",
    stage: "Match status + SOAP begins",
    phase: "Match Week",
    summary:
      "Applicant Match status becomes available and the Supplemental Offer and Acceptance Program (SOAP) begins.",
    whyItMatters:
      "R3 is the authoritative source for your SOAP eligibility and the positions for which you may apply.",
    actions: [
      "At 10 a.m. ET, check R3 for your Match status; treat email as a courtesy notification.",
      "If eligible for SOAP, use only the R3 List of Unfilled Programs and follow the listed application process.",
      "From 11 a.m. ET, prepare applications for positions for which R3 shows you are eligible.",
      "Stay reachable and coordinate closely with your school or advisor throughout SOAP.",
    ],
  },
  {
    date: "2027-03-18",
    shortDate: "Mar 18",
    time: "9 a.m.–9 p.m. ET",
    stage: "SOAP offer rounds",
    phase: "Match Week",
    summary:
      "SOAP rounds begin at 9 a.m. ET and end at 9 p.m. ET with the final List of Unfilled Programs posted in R3.",
    whyItMatters:
      "Offers move on a fixed schedule. Your choices and responses must be made through the official process during the available windows.",
    actions: [
      "Review every offer against specialty, location, visa, and training requirements before responding.",
      "Monitor R3 and the schedule continuously; do not rely on unofficial vacancy lists.",
      "After SOAP closes at 9 p.m. ET, use the final R3 List of Unfilled Programs for any next steps.",
    ],
  },
  {
    date: "2027-03-19",
    shortDate: "Mar 19",
    time: "12 p.m. ET",
    stage: "Match Day",
    phase: "Match Week",
    summary:
      "Match results become available to applicants in R3 and by courtesy email at noon ET.",
    whyItMatters:
      "This result identifies the program where a matched applicant has made a binding commitment to train.",
    actions: [
      "Log into R3 at noon ET to view your official result.",
      "Save your result and follow your matched program's onboarding instructions.",
      "Attend your school's Match Day activities if applicable and update your advisor or support network.",
    ],
  },
];

function dayValue(date: string) {
  return Date.parse(`${date}T12:00:00Z`);
}

/**
 * Places today between evenly spaced milestones. Milestones remain readable even
 * during Match Week, while the marker advances proportionally every day between
 * the two dates that surround it.
 */
export function getResidencyTimelinePosition(
  milestones: Pick<ResidencyMatchMilestone, "date">[],
  today: string,
) {
  if (milestones.length < 2) return 0;

  const current = dayValue(today);
  const first = dayValue(milestones[0]!.date);
  const last = dayValue(milestones[milestones.length - 1]!.date);

  if (!Number.isFinite(current) || current <= first) return 0;
  if (current >= last) return 100;

  const segment = milestones.findIndex(
    (milestone, index) =>
      index < milestones.length - 1 &&
      current >= dayValue(milestone.date) &&
      current < dayValue(milestones[index + 1]!.date),
  );

  if (segment < 0) return 0;

  const segmentStart = dayValue(milestones[segment]!.date);
  const segmentEnd = dayValue(milestones[segment + 1]!.date);
  const withinSegment = (current - segmentStart) / (segmentEnd - segmentStart);

  return ((segment + withinSegment) / (milestones.length - 1)) * 100;
}
