import type { InterviewSpecialtyId } from "@/lib/interview/questions";

export const interviewScoreLabels = {
  1: "Needs Significant Development",
  2: "Developing",
  3: "Competent",
  4: "Strong",
  5: "Exceptional",
} as const;

export type InterviewScore = 1 | 2 | 3 | 4 | 5;

export type RubricCriterion = {
  competencyId: string;
  weight: number;
  anchors: Partial<Record<InterviewScore, string>>;
};

export type InterviewRubric = {
  rubricId: string;
  version: string;
  questionId?: string;
  status: "draft" | "active" | "retired";
  criteria: RubricCriterion[];
  criticalElements?: string[];
  redFlags?: string[];
};

export type EvaluatedCompetency = {
  competencyId: string;
  score: InterviewScore;
  weight: number;
  evidence: string;
  feedback: string;
};

export type QuestionEvaluationInput = {
  questionId: string;
  rubricId: string;
  rubricVersion: string;
  competencyScores: EvaluatedCompetency[];
  strengths: string[];
  improvements: string[];
};

export type CompetencyAggregate = {
  competencyId: string;
  score: number;
  numberOfQuestionsAssessed: number;
};

export type MockInterviewSession = {
  id: string;
  userId: string;
  specialty: InterviewSpecialtyId;
  startedAt: string;
  completedAt?: string;
  selectedQuestionIds: string[];
  currentQuestionIndex: number;
  status: "in_progress" | "awaiting_evaluation" | "completed" | "abandoned";
};
