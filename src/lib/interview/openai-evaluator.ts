import { z } from "zod";
import type { RubricFamilyDefinition } from "./rubric-catalog";
import type { InterviewQuestion } from "./questions";

const criterionEvaluationSchema = z.object({
  competencyId: z.string().min(1),
  score: z.number().int().min(1).max(5),
  evidence: z.string().min(1).max(500),
  missingForNextLevel: z.string().min(1).max(500),
});

export const interviewEvaluationSchema = z.object({
  criteria: z.array(criterionEvaluationSchema).min(3).max(5),
  strengths: z.array(z.string().min(1).max(400)).max(3),
  improvements: z.array(z.string().min(1).max(400)).max(3),
  summary: z.string().min(1).max(700),
  criticalElementsMissing: z.array(z.string().min(1).max(300)).max(5),
  redFlagsObserved: z.array(z.string().min(1).max(300)).max(5),
});

export type InterviewEvaluation = z.infer<typeof interviewEvaluationSchema>;

const jsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["criteria", "strengths", "improvements", "summary", "criticalElementsMissing", "redFlagsObserved"],
  properties: {
    criteria: { type: "array", minItems: 3, maxItems: 5, items: { type: "object", additionalProperties: false, required: ["competencyId", "score", "evidence", "missingForNextLevel"], properties: {
      competencyId: { type: "string" }, score: { type: "integer", minimum: 1, maximum: 5 }, evidence: { type: "string" }, missingForNextLevel: { type: "string" },
    } } },
    strengths: { type: "array", maxItems: 3, items: { type: "string" } },
    improvements: { type: "array", maxItems: 3, items: { type: "string" } },
    summary: { type: "string" },
    criticalElementsMissing: { type: "array", maxItems: 5, items: { type: "string" } },
    redFlagsObserved: { type: "array", maxItems: 5, items: { type: "string" } },
  },
} as const;

export async function evaluateInterviewTranscript({ question, rubric, transcript }: {
  question: InterviewQuestion;
  rubric: RubricFamilyDefinition & { version: string; criteriaWithAnchors: unknown[] };
  transcript: string;
}) {
  if (!transcript.trim()) throw new Error("NO_USABLE_TRANSCRIPT");
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
  const response = await fetch(`${process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1"}/responses`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: process.env.OPENAI_INTERVIEW_EVALUATION_MODEL ?? "gpt-5.6-luna",
      store: false,
      instructions: [
        "Evaluate only observable evidence in the supplied transcript against the supplied rubric.",
        "Do not assess or infer appearance, accent, nationality, race, gender, socioeconomic status, personality, confidence, truthfulness, intelligence, or residency success.",
        "Do not mix delivery metrics into competency scores. Do not provide chain-of-thought.",
        "Use concise transcript evidence. If evidence is absent, score accordingly; never invent it.",
        "Return one criterion result for every supplied criterion, preserving competency IDs exactly.",
        "STAR may help organize behavioral answers but is not mandatory. Do not penalize legitimate logistical closing questions solely for being logistical.",
      ].join(" "),
      input: JSON.stringify({
        question: question.text,
        questionType: question.questionType,
        practiceArea: question.practiceArea,
        rubricId: rubric.id,
        rubricVersion: rubric.version,
        criteria: rubric.criteriaWithAnchors,
        criticalElements: rubric.criticalElements ?? [],
        redFlags: rubric.concerns,
        transcript,
      }),
      text: { format: { type: "json_schema", name: "interview_rubric_evaluation", strict: true, schema: jsonSchema } },
    }),
  });
  if (!response.ok) throw new Error(`OPENAI_EVALUATION_${response.status}`);
  const body = await response.json() as { output_text?: string; output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
  const text = body.output_text ?? body.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
  if (!text) throw new Error("OPENAI_EMPTY_EVALUATION");
  const parsed = interviewEvaluationSchema.parse(JSON.parse(text));
  const expected = rubric.criteria.map((criterion) => criterion.competencyId);
  const received = parsed.criteria.map((criterion) => criterion.competencyId);
  if (received.length !== expected.length || expected.some((id) => !received.includes(id)))
    throw new Error("OPENAI_RUBRIC_MISMATCH");
  return parsed;
}
