import type { InterviewQuestion, InterviewSpecialtyId } from "@/lib/interview/questions";

export function recommendInterviewQuestions({
  questions,
  priorityCompetencies,
  specialty,
  excludedQuestionIds = [],
  limit = 5,
}: {
  questions: readonly InterviewQuestion[];
  priorityCompetencies: readonly string[];
  specialty: InterviewSpecialtyId;
  excludedQuestionIds?: readonly string[];
  limit?: number;
}) {
  const excluded = new Set(excludedQuestionIds);
  return questions
    .filter(
      (question) =>
        !excluded.has(question.id) &&
        question.competencies.some((id) => priorityCompetencies.includes(id)) &&
        (question.specialtyRelevance.includes("general") ||
          question.specialtyRelevance.includes(specialty)),
    )
    .map((question) => {
      const priorityIndex = priorityCompetencies.findIndex((id) =>
        question.competencies.includes(id),
      );
      const tagIndex = question.competencies.findIndex((id) =>
        priorityCompetencies.includes(id),
      );
      const specialtyBoost = question.specialtyRelevance.includes(specialty)
        ? 2
        : 0;
      return {
        question,
        rank:
          (priorityIndex < 0 ? 0 : 20 - priorityIndex * 4) +
          (3 - tagIndex) +
          specialtyBoost,
      };
    })
    .sort(
      (a, b) => b.rank - a.rank || a.question.id.localeCompare(b.question.id),
    )
    .slice(0, limit)
    .map(({ question }) => question);
}
