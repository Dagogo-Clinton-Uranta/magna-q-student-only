import {
  INTERVIEW_RUBRIC_VERSION,
  rubricFamilyForQuestion,
} from "@/lib/interview/rubric-catalog";

export type InterviewCategory = {
  slug: string;
  title: string;
  questions: string[];
};

export const interviewPracticeAreas = [
  {
    id: "communication-interpersonal",
    title: "Communication & Interpersonal Skills",
    description:
      "Organize clear answers, listen actively, and communicate experiences with relevance and empathy.",
  },
  {
    id: "professionalism-integrity",
    title: "Professionalism & Integrity",
    description:
      "Explain ethical decisions, accountability, boundaries, and professional responsibilities.",
  },
  {
    id: "teamwork-collaboration",
    title: "Teamwork & Collaboration",
    description:
      "Show how you contribute, navigate conflict, give feedback, and work across disciplines.",
  },
  {
    id: "self-awareness-reflection",
    title: "Self-Awareness & Reflective Learning",
    description:
      "Discuss feedback, mistakes, growth, limitations, and deliberate improvement with insight.",
  },
  {
    id: "patient-safety-judgment",
    title: "Patient Safety & Clinical Judgment",
    description:
      "Communicate safe escalation, uncertainty, error response, and patient-centered judgment.",
  },
  {
    id: "resilience-adaptability",
    title: "Resilience & Adaptability",
    description:
      "Reflect on setbacks, changing conditions, sustainable coping, and recovery after difficulty.",
  },
  {
    id: "leadership-systems",
    title: "Leadership & Systems Thinking",
    description:
      "Demonstrate responsible leadership, improvement thinking, delegation, and systems awareness.",
  },
  {
    id: "motivation-values-fit",
    title: "Motivation, Values & Residency Fit",
    description:
      "Connect your motivations, specialty choice, goals, and values to residency training.",
  },
  {
    id: "equity-cultural-humility",
    title: "Equity, Cultural Humility & Advocacy",
    description:
      "Discuss bias, access, advocacy, cultural humility, and equitable patient care.",
  },
  {
    id: "research-evidence",
    title: "Research & Evidence-Based Practice",
    description:
      "Explain scholarship, evidence appraisal, research contributions, and intellectual curiosity.",
  },
] as const;

export type InterviewPracticeAreaId =
  (typeof interviewPracticeAreas)[number]["id"];
export type InterviewQuestionType = "general" | "behavioral" | "situational";
export type InterviewDifficulty = "foundational" | "intermediate" | "advanced";

export const interviewSpecialties = [
  { id: "general", title: "General" },
  { id: "internal-medicine", title: "Internal Medicine" },
  { id: "surgery", title: "Surgery" },
  { id: "pediatrics", title: "Pediatrics" },
  { id: "psychiatry", title: "Psychiatry" },
  { id: "emergency-medicine", title: "Emergency Medicine" },
  { id: "family-medicine", title: "Family Medicine" },
  { id: "anesthesiology", title: "Anesthesiology" },
  { id: "radiology", title: "Radiology" },
  { id: "dermatology", title: "Dermatology" },
] as const;

export type InterviewSpecialtyId = (typeof interviewSpecialties)[number]["id"];

export type InterviewQuestion = {
  id: string;
  text: string;
  practiceArea: InterviewPracticeAreaId;
  questionType: InterviewQuestionType;
  competencies: string[];
  specialtyRelevance: InterviewSpecialtyId[];
  difficulty: InterviewDifficulty;
  rubricId?: string;
  legacyCategorySlug: string;
  legacyCategoryTitle: string;
  legacyQuestionIndex: number;
};

export const interviewCategories: InterviewCategory[] = [
  {
    slug: "personal-background",
    title: "Personal & Background",
    questions: [
      "Tell me about yourself.",
      "Walk me through your CV.",
      "What three words best describe you?",
      "What makes you unique?",
      "Tell me something that's not on your CV.",
      "What motivates you?",
      "What are your hobbies?",
      "What accomplishment are you most proud of?",
      "Who has influenced your career most?",
      "What would your friends say about you?",
    ],
  },
  {
    slug: "why-medicine",
    title: "Why Medicine?",
    questions: [
      "Why did you become a doctor?",
      "Why medicine instead of another profession?",
      "When did you know medicine was right for you?",
      "What keeps you motivated?",
      "What has been your most rewarding patient interaction?",
      "What has been your most difficult patient interaction?",
      "What is the biggest lesson you've learned in medicine?",
      "What would you change about medical school?",
      "What has surprised you most about medicine?",
      "What qualities make a good physician?",
    ],
  },
  {
    slug: "why-this-specialty",
    title: "Why This Specialty?",
    questions: [
      "Why Internal Medicine?",
      "Why Surgery?",
      "Why Pediatrics?",
      "Why Psychiatry?",
      "Why Emergency Medicine?",
      "Why Family Medicine?",
      "Why Anesthesiology?",
      "Why Radiology?",
      "Why Dermatology?",
      "What excites you about this specialty?",
      "What challenges do you anticipate?",
      "Why not another specialty?",
    ],
  },
  {
    slug: "why-our-program",
    title: "Why Our Program?",
    questions: [
      "Why our residency?",
      "What attracted you here?",
      "What do you know about our program?",
      "What strengths of our program appeal to you?",
      "Why should we rank you?",
      "What will you contribute?",
      "How do you fit our culture?",
      "Why this city?",
      "What are you looking for in residency?",
      "What factors are most important to you?",
    ],
  },
  {
    slug: "strengths-weaknesses",
    title: "Strengths & Weaknesses",
    questions: [
      "What are your greatest strengths?",
      "What is your biggest weakness?",
      "Tell me about a mistake you made.",
      "What skill are you currently improving?",
      "What constructive criticism have you received?",
      "Tell me about a failure.",
      "How did you recover?",
      "What would you change about yourself?",
      "What personal habit would you like to improve?",
      "What's something you're still learning?",
    ],
  },
  {
    slug: "behavioral-star",
    title: "Behavioral (STAR)",
    questions: [
      "Tell me about a time you led a team.",
      "Tell me about a conflict.",
      "Tell me about a difficult patient.",
      "Tell me about an angry colleague.",
      "Describe a stressful situation.",
      "Describe a medical error.",
      "Tell me about a time you received criticism.",
      "Tell me about a time you disagreed with your attending.",
      "Tell me about a difficult ethical decision.",
      "Tell me about a patient who changed you.",
    ],
  },
  {
    slug: "leadership",
    title: "Leadership",
    questions: [
      "Describe your leadership style.",
      "Tell me about a leadership role.",
      "How do you motivate others?",
      "Tell me about leading under pressure.",
      "Describe a difficult leadership decision.",
      "What makes a good leader?",
      "What makes a bad leader?",
      "How do you delegate?",
      "How do you build trust?",
      "How do you resolve disagreements?",
    ],
  },
  {
    slug: "teamwork",
    title: "Teamwork",
    questions: [
      "Describe working in a multidisciplinary team.",
      "How do you handle difficult coworkers?",
      "Tell me about excellent teamwork.",
      "What role do you naturally play?",
      "How do you communicate?",
      "Describe collaboration.",
      "Tell me about a disagreement.",
      "How do you handle criticism?",
      "How do you give feedback?",
      "What does professionalism mean?",
    ],
  },
  {
    slug: "ethics",
    title: "Ethics",
    questions: [
      "What would you do if a colleague was intoxicated?",
      "What if you witnessed patient abuse?",
      "How would you disclose an error?",
      "Should a patient always tell the truth?",
      "What if a patient refuses treatment?",
      "How do you handle confidentiality?",
      "What would you do if your attending asked you to lie?",
      "What if you made a medication error?",
      "How do you balance autonomy and beneficence?",
      "When is it appropriate to break confidentiality?",
    ],
  },
  {
    slug: "diversity-inclusion",
    title: "Diversity & Inclusion",
    questions: [
      "Describe caring for someone from another culture.",
      "How do you reduce bias?",
      "What does health equity mean?",
      "How do you communicate through interpreters?",
      "Tell me about inclusion.",
      "How do you respond to discrimination?",
      "Describe cultural humility.",
      "Tell me about advocacy.",
      "Have you witnessed inequity?",
      "How would you address it?",
    ],
  },
  {
    slug: "patient-safety",
    title: "Patient Safety",
    questions: [
      "What is patient safety?",
      "Tell me about a near miss.",
      "How do you reduce medical errors?",
      "What is a safety culture?",
      "Why are checklists important?",
      "How do you report incidents?",
      "How do you manage fatigue?",
      "What if you're unsure?",
      "How do you escalate concerns?",
      "How do you ensure safe handovers?",
    ],
  },
  {
    slug: "research",
    title: "Research",
    questions: [
      "Describe your research.",
      "What did you learn?",
      "Tell me about your publications.",
      "What statistical methods did you use?",
      "What are your future research interests?",
      "How do you interpret evidence?",
      "Describe evidence-based medicine.",
      "Have you presented research?",
      "What was your biggest challenge?",
      "Why is research important?",
    ],
  },
  {
    slug: "resilience",
    title: "Resilience",
    questions: [
      "How do you handle stress?",
      "Tell me about burnout.",
      "What keeps you resilient?",
      "Describe a difficult rotation.",
      "How do you manage work-life balance?",
      "What do you do outside medicine?",
      "How do you cope with setbacks?",
      "Tell me about perseverance.",
      "Describe adapting to change.",
      "What motivates you after failure?",
    ],
  },
  {
    slug: "career-goals",
    title: "Career Goals",
    questions: [
      "Where do you see yourself in 10 years?",
      "What are your fellowship plans?",
      "Do you prefer academic or community practice?",
      "What are your leadership ambitions?",
      "What are your research interests?",
      "What are your teaching interests?",
      "How does global health fit your plans?",
      "Are you interested in private practice?",
      "What legacy do you want to leave?",
      "How will residency help you reach your goals?",
    ],
  },
  {
    slug: "healthcare-systems",
    title: "Healthcare Systems",
    questions: [
      "What is the biggest challenge facing healthcare?",
      "What are your thoughts on AI in medicine?",
      "How should we address physician shortages?",
      "How should healthcare costs be addressed?",
      "What is the role of preventive medicine?",
      "What are your thoughts on value-based care?",
      "How is telemedicine changing care?",
      "How should medicine address burnout?",
      "What is the physician's role in public health?",
      "What makes quality improvement effective?",
    ],
  },
  {
    slug: "closing-questions",
    title: "Closing Questions",
    questions: [
      "Why should we choose you?",
      "What questions do you have for us?",
      "Is there anything else we should know?",
      "Why should we rank you highly?",
      "What would you like us to remember?",
      "Do you have any concerns about your application?",
      "What will you contribute?",
      "What are you looking for in mentors?",
      "How do you define success?",
      "Do you have any final comments?",
    ],
  },
];

export function getInterviewCategory(slug: string) {
  return interviewCategories.find((category) => category.slug === slug);
}

const categoryArea: Record<string, InterviewPracticeAreaId> = {
  "personal-background": "communication-interpersonal",
  "why-medicine": "motivation-values-fit",
  "why-this-specialty": "motivation-values-fit",
  "why-our-program": "motivation-values-fit",
  "strengths-weaknesses": "self-awareness-reflection",
  "behavioral-star": "teamwork-collaboration",
  leadership: "leadership-systems",
  teamwork: "teamwork-collaboration",
  ethics: "professionalism-integrity",
  "diversity-inclusion": "equity-cultural-humility",
  "patient-safety": "patient-safety-judgment",
  research: "research-evidence",
  resilience: "resilience-adaptability",
  "career-goals": "motivation-values-fit",
  "healthcare-systems": "leadership-systems",
  "closing-questions": "communication-interpersonal",
};

const specialtyQuestionMap: Record<string, InterviewSpecialtyId> = {
  "Why Internal Medicine?": "internal-medicine",
  "Why Surgery?": "surgery",
  "Why Pediatrics?": "pediatrics",
  "Why Psychiatry?": "psychiatry",
  "Why Emergency Medicine?": "emergency-medicine",
  "Why Family Medicine?": "family-medicine",
  "Why Anesthesiology?": "anesthesiology",
  "Why Radiology?": "radiology",
  "Why Dermatology?": "dermatology",
};

function classifyArea(
  categorySlug: string,
  question: string,
): InterviewPracticeAreaId {
  if (
    /medical error|medication error|near miss|patient safety|safe handover/i.test(
      question,
    )
  )
    return "patient-safety-judgment";
  if (
    /ethical|intoxicated|patient abuse|confidentiality|asked you to lie|refuses treatment/i.test(
      question,
    )
  )
    return "professionalism-integrity";
  if (/led a team|leadership|delegate|motivate others/i.test(question))
    return "leadership-systems";
  if (
    /another culture|bias|equity|inclusion|discrimination|cultural humility|advocacy|inequity/i.test(
      question,
    )
  )
    return "equity-cultural-humility";
  return categoryArea[categorySlug] ?? "communication-interpersonal";
}

function classifyQuestionType(
  categorySlug: string,
  question: string,
): InterviewQuestionType {
  if (
    categorySlug === "behavioral-star" ||
    /tell me about a time|tell me about (a conflict|a failure|a mistake|an angry|a difficult|excellent teamwork|a disagreement|a near miss|perseverance)|describe (a stressful|a medical|a difficult|adapting|working|collaboration|caring)/i.test(
      question,
    )
  )
    return "behavioral";
  if (
    /^(what would|what if|how would|should a patient|when is it appropriate)/i.test(
      question,
    )
  )
    return "situational";
  return "general";
}

export const interviewQuestions: InterviewQuestion[] =
  interviewCategories.flatMap((category) =>
    category.questions.map((text, index) => {
      const practiceArea = classifyArea(category.slug, text);
      const questionType = classifyQuestionType(category.slug, text);
      const specialty = specialtyQuestionMap[text];
      const id = `${category.slug}-${String(index + 1).padStart(2, "0")}`;
      const rubricFamily = rubricFamilyForQuestion({
        id,
        text,
        practiceArea,
        questionType,
      });
      return {
        id,
        text,
        practiceArea,
        questionType,
        competencies: rubricFamily.criteria.map((item) => item.competencyId),
        specialtyRelevance: specialty ? [specialty] : ["general"],
        difficulty:
          questionType === "situational"
            ? "advanced"
            : questionType === "behavioral"
              ? "intermediate"
              : "foundational",
        legacyCategorySlug: category.slug,
        legacyCategoryTitle: category.title,
        legacyQuestionIndex: index,
        rubricId: `${rubricFamily.id}@${INTERVIEW_RUBRIC_VERSION}`,
      } satisfies InterviewQuestion;
    }),
  );

export function getInterviewQuestion(id: string) {
  return interviewQuestions.find((question) => question.id === id);
}

export function getInterviewPracticeArea(id: string) {
  return interviewPracticeAreas.find((area) => area.id === id);
}

export function questionsForPracticeArea(id: InterviewPracticeAreaId) {
  return interviewQuestions.filter((question) => question.practiceArea === id);
}
