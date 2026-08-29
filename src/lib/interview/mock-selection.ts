import type {
  InterviewQuestion,
  InterviewSpecialtyId,
} from "@/lib/interview/questions";

export const mockInterviewBlueprint = [
  "opening-communication",
  "motivation-fit",
  "teamwork-behavioral",
  "professionalism-ethics",
  "reflection-adaptability",
  "patient-safety-judgment",
  "leadership-systems-breadth",
  "career-values-closing",
] as const;

type BlueprintSlot = (typeof mockInterviewBlueprint)[number];

function belongsToSlot(question: InterviewQuestion, slot: BlueprintSlot) {
  switch (slot) {
    case "opening-communication":
      return question.legacyCategorySlug === "personal-background";
    case "motivation-fit":
      return ["why-medicine", "why-this-specialty", "why-our-program"].includes(
        question.legacyCategorySlug,
      );
    case "teamwork-behavioral":
      return (
        question.practiceArea === "teamwork-collaboration" &&
        question.questionType === "behavioral"
      );
    case "professionalism-ethics":
      return question.practiceArea === "professionalism-integrity";
    case "reflection-adaptability":
      return ["self-awareness-reflection", "resilience-adaptability"].includes(
        question.practiceArea,
      );
    case "patient-safety-judgment":
      return question.practiceArea === "patient-safety-judgment";
    case "leadership-systems-breadth":
      return [
        "leadership-systems",
        "equity-cultural-humility",
        "research-evidence",
      ].includes(question.practiceArea);
    case "career-values-closing":
      return ["career-goals", "closing-questions"].includes(
        question.legacyCategorySlug,
      );
  }
}

function specialtyEligible(
  question: InterviewQuestion,
  specialty: InterviewSpecialtyId,
) {
  return (
    question.specialtyRelevance.includes("general") ||
    question.specialtyRelevance.includes(specialty)
  );
}

function normalizedTerms(text: string) {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 3),
  );
}

function substantiallyRepeats(a: InterviewQuestion, b: InterviewQuestion) {
  const aTerms = normalizedTerms(a.text);
  const bTerms = normalizedTerms(b.text);
  const shared = [...aTerms].filter((term) => bTerms.has(term)).length;
  const union = new Set([...aTerms, ...bTerms]).size;
  return union > 0 && shared / union >= 0.72;
}

function shuffled<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target]!, result[index]!];
  }
  return result;
}

export function selectMockInterviewQuestions({
  questions,
  specialty,
  random = Math.random,
}: {
  questions: readonly InterviewQuestion[];
  specialty: InterviewSpecialtyId;
  random?: () => number;
}) {
  const eligible = questions.filter((question) =>
    specialtyEligible(question, specialty),
  );
  const selected: InterviewQuestion[] = [];

  for (const slot of mockInterviewBlueprint) {
    const pool = shuffled(
      eligible.filter(
        (question) =>
          belongsToSlot(question, slot) &&
          !selected.some(
            (existing) =>
              existing.id === question.id ||
              substantiallyRepeats(existing, question),
          ),
      ),
      random,
    );
    const question = pool[0];
    if (!question)
      throw new Error(
        `Mock interview blueprint has no eligible question for ${slot}.`,
      );
    selected.push(question);
  }
  return selected;
}

export function mockBlueprintSlotForQuestion(question: InterviewQuestion) {
  return mockInterviewBlueprint.find((slot) => belongsToSlot(question, slot));
}
