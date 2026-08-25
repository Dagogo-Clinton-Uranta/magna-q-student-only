export const STUDENT_STAGES = [
  "step1",
  "step2ck",
  "step3",
  "residency_interviews",
] as const;

export type StudentStage = (typeof STUDENT_STAGES)[number];

export type StageDefinition = {
  value: StudentStage;
  rank: 1 | 2 | 3 | 4;
  label: string;
  shortLabel: string;
  description: string;
  examCode: "step1" | "step2ck" | "step3" | null;
  resourceSlug: string;
  guideSlug: "step-1" | "step-2-ck" | "step-3" | "residency-match";
};

export const STAGE_DEFINITIONS: readonly StageDefinition[] = [
  {
    value: "step1",
    rank: 1,
    label: "USMLE Step 1",
    shortLabel: "Step 1",
    description: "Foundational science and Step 1 preparation",
    examCode: "step1",
    resourceSlug: "usmle-step-1",
    guideSlug: "step-1",
  },
  {
    value: "step2ck",
    rank: 2,
    label: "USMLE Step 2 CK",
    shortLabel: "Step 2 CK",
    description: "Clinical knowledge and supervised patient care",
    examCode: "step2ck",
    resourceSlug: "usmle-step-2-ck",
    guideSlug: "step-2-ck",
  },
  {
    value: "step3",
    rank: 3,
    label: "USMLE Step 3",
    shortLabel: "Step 3",
    description: "Independent clinical decision-making",
    examCode: "step3",
    resourceSlug: "usmle-step-3",
    guideSlug: "step-3",
  },
  {
    value: "residency_interviews",
    rank: 4,
    label: "Residency interviews & Match",
    shortLabel: "Residency Match",
    description: "Applications, interviews, ranking, and Match Day",
    examCode: null,
    resourceSlug: "interview-resources",
    guideSlug: "residency-match",
  },
] as const;

export function isStudentStage(value: unknown): value is StudentStage {
  return STUDENT_STAGES.includes(value as StudentStage);
}

export function getStageDefinition(stage: StudentStage) {
  return STAGE_DEFINITIONS.find((item) => item.value === stage)!;
}

export function getStageForResourceSlug(slug: string) {
  return STAGE_DEFINITIONS.find((item) => item.resourceSlug === slug)?.value;
}

export function getStageForGuideSlug(slug: string) {
  return STAGE_DEFINITIONS.find((item) => item.guideSlug === slug)?.value;
}
