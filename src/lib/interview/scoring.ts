import type {
  CompetencyAggregate,
  QuestionEvaluationInput,
} from "@/lib/interview/types";

export const practiceAssessmentThresholds = [
  { minimum: 4.5, label: "Exceptional" },
  { minimum: 3.5, label: "Strong" },
  { minimum: 2.5, label: "Competent" },
  { minimum: 1.5, label: "Developing" },
  { minimum: 1, label: "Needs Significant Development" },
] as const;

export function weightedQuestionScore(evaluation: QuestionEvaluationInput) {
  const totalWeight = evaluation.competencyScores.reduce(
    (total, item) => total + item.weight,
    0,
  );
  if (totalWeight <= 0)
    throw new Error("Rubric criterion weights must total above zero.");
  return (
    evaluation.competencyScores.reduce(
      (total, item) => total + item.score * item.weight,
      0,
    ) / totalWeight
  );
}

export function aggregateCompetencyScores(
  evaluations: readonly QuestionEvaluationInput[],
): CompetencyAggregate[] {
  const totals = new Map<
    string,
    { weighted: number; weight: number; count: number }
  >();
  for (const evaluation of evaluations) {
    for (const item of evaluation.competencyScores) {
      const current = totals.get(item.competencyId) ?? {
        weighted: 0,
        weight: 0,
        count: 0,
      };
      current.weighted += item.score * item.weight;
      current.weight += item.weight;
      current.count += 1;
      totals.set(item.competencyId, current);
    }
  }
  return [...totals.entries()]
    .filter(([, value]) => value.weight > 0)
    .map(([competencyId, value]) => ({
      competencyId,
      score: value.weighted / value.weight,
      numberOfQuestionsAssessed: value.count,
    }))
    .sort(
      (a, b) =>
        b.score - a.score || a.competencyId.localeCompare(b.competencyId),
    );
}

export function overallPracticeAssessment(
  evaluations: readonly QuestionEvaluationInput[],
) {
  if (!evaluations.length) return null;
  return (
    evaluations.reduce(
      (total, item) => total + weightedQuestionScore(item),
      0,
    ) / evaluations.length
  );
}

export function scoreToPercentage(score: number) {
  return Math.round(Math.max(0, Math.min(100, (score - 1) * 25)));
}

export function practiceAssessmentLabel(score: number) {
  return (
    practiceAssessmentThresholds.find((threshold) => score >= threshold.minimum)
      ?.label ?? "Not assessed"
  );
}

export function strongestAndWeakestCompetencies(
  aggregates: readonly CompetencyAggregate[],
  minimumAssessments = 1,
) {
  const sufficient = aggregates.filter(
    (item) => item.numberOfQuestionsAssessed >= minimumAssessments,
  );
  return {
    strongest: [...sufficient].sort((a, b) => b.score - a.score).slice(0, 3),
    weakest: [...sufficient].sort((a, b) => a.score - b.score).slice(0, 3),
  };
}
