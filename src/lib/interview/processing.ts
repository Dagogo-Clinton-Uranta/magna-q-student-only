import type { SupabaseClient } from "@supabase/supabase-js";
import { getInterviewQuestion, interviewQuestions } from "./questions";
import {
  competencyById,
  INTERVIEW_RUBRIC_VERSION,
  rubricFamilyForQuestion,
} from "./rubric-catalog";
import {
  evaluateInterviewTranscript,
  type InterviewEvaluation,
} from "./openai-evaluator";
import {
  aggregateCompetencyScores,
  overallPracticeAssessment,
  practiceAssessmentLabel,
  strongestAndWeakestCompetencies,
  weightedQuestionScore,
} from "./scoring";
import { recommendInterviewQuestions } from "./recommendations";
import type { InterviewTranscript } from "./deepgram";
import type { InterviewScore, QuestionEvaluationInput } from "./types";
import { mockReadyForFinalization } from "./finalization";

type Db = SupabaseClient;

export async function persistTranscript(
  db: Db,
  answerId: string,
  transcript: InterviewTranscript,
) {
  const { error } = await db
    .from("interview_processing_answers")
    .update({
      status: "TRANSCRIBED",
      transcript: transcript.transcript,
      transcript_words: transcript.words,
      transcript_confidence: transcript.confidence,
      transcript_duration_seconds: transcript.durationSeconds,
      transcription_request_id: transcript.requestId,
      delivery_metrics: transcript.deliveryMetrics,
      provider_error_code: null,
      user_error_message: null,
    })
    .eq("id", answerId);
  if (error) throw error;
}

export async function evaluateAndPersistAnswer(db: Db, answerId: string) {
  const { data: answer, error } = await db
    .from("interview_processing_answers")
    .select("*")
    .eq("id", answerId)
    .single();
  if (error || !answer) throw error ?? new Error("ANSWER_NOT_FOUND");
  if (["EVALUATED", "COMPLETED"].includes(answer.status)) return answer;
  if (!answer.transcript) throw new Error("NO_USABLE_TRANSCRIPT");
  const question = getInterviewQuestion(answer.question_id);
  if (!question) throw new Error("QUESTION_NOT_FOUND");
  const family = rubricFamilyForQuestion(question);
  const { data: mapping, error: mappingError } = await db
    .from("interview_question_rubric_mappings")
    .select("*")
    .eq("question_id", question.id)
    .single();
  if (mappingError || !mapping)
    throw mappingError ?? new Error("RUBRIC_MAPPING_NOT_FOUND");
  await db
    .from("interview_processing_answers")
    .update({ status: "EVALUATING" })
    .eq("id", answerId);
  const evaluation = await evaluateInterviewTranscript({
    question,
    rubric: {
      ...family,
      version: mapping.rubric_version,
      criteriaWithAnchors: mapping.criteria,
    },
    transcript: answer.transcript,
  });
  const normalized = normalizeEvaluation(
    evaluation,
    family.criteria,
    Boolean(family.criticalElements?.length),
  );
  const weightedScore = weightedQuestionScore(normalized);
  const evaluationRow = {
    user_id: answer.user_id,
    mock_session_id: answer.mock_session_id,
    individual_result_id: answer.individual_result_id,
    question_id: question.id,
    question_text: question.text,
    question_type: question.questionType,
    practice_area: question.practiceArea,
    competencies: question.competencies,
    mock_position: answer.mock_position,
    transcript: answer.transcript,
    rubric_id: mapping.rubric_id,
    rubric_key: mapping.rubric_key,
    rubric_version: mapping.rubric_version,
    scored_criteria: normalized.competencyScores,
    competency_scores: normalized.competencyScores,
    evidence: normalized.competencyScores.map((item) => ({
      competencyId: item.competencyId,
      evidence: item.evidence,
    })),
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    structured_feedback: {
      summary: evaluation.summary,
      criticalElementsMissing: evaluation.criticalElementsMissing,
      redFlagsObserved: evaluation.redFlagsObserved,
    },
    weighted_score: weightedScore,
  };
  const conflict = answer.individual_result_id
    ? "individual_result_id"
    : "mock_session_id,mock_position";
  const { error: evaluationError } = await db
    .from("interview_question_evaluations")
    .upsert(evaluationRow, { onConflict: conflict });
  if (evaluationError) throw evaluationError;
  await db
    .from("interview_processing_answers")
    .update({ status: "EVALUATED", evaluation_output: evaluation })
    .eq("id", answerId);
  if (answer.individual_result_id)
    await finalizeIndividualResult(
      db,
      answer.individual_result_id,
      normalized,
      mapping,
      answerId,
    );
  return { ...answer, status: "EVALUATED", evaluation_output: evaluation };
}

export async function finalizeMockResult(db: Db, sessionId: string) {
  const { data: session } = await db
    .from("interview_mock_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();
  if (!session || session.status === "completed") return;
  const { data: answers } = await db
    .from("interview_processing_answers")
    .select("id,status")
    .eq("mock_session_id", sessionId);
  const { data: rows } = await db
    .from("interview_question_evaluations")
    .select("*")
    .eq("mock_session_id", sessionId)
    .order("mock_position");
  if (!mockReadyForFinalization(answers ?? [], (rows ?? []).length))
    throw new Error("MOCK_REQUIRES_EIGHT_EVALUATED_ANSWERS");
  await db
    .from("interview_processing_answers")
    .update({ status: "FINALIZING" })
    .eq("mock_session_id", sessionId)
    .eq("status", "EVALUATED");
  const evaluations = rows!.map(rowToEvaluationInput);
  const aggregates = aggregateCompetencyScores(evaluations);
  const overall = overallPracticeAssessment(evaluations)!;
  const { strongest, weakest } = strongestAndWeakestCompetencies(aggregates, 1);
  await db.from("interview_competency_aggregates").upsert(
    aggregates.map((item) => ({
      user_id: session.user_id,
      mock_session_id: sessionId,
      competency_id: item.competencyId,
      score: item.score,
      questions_assessed: item.numberOfQuestionsAssessed,
    })),
    { onConflict: "mock_session_id,competency_id" },
  );
  await replaceRecommendations(db, {
    userId: session.user_id,
    sessionId,
    specialty: session.specialty,
    priorities: weakest.map((item) => item.competencyId),
    excluded: session.selected_question_ids,
  });
  const completedAt = new Date().toISOString();
  const { error } = await db
    .from("interview_mock_sessions")
    .update({
      status: "completed",
      completed_at: completedAt,
      practice_assessment: overall,
      assessment_label: practiceAssessmentLabel(overall),
      strongest_competencies: strongest,
      priority_development_competencies: weakest,
      rubric_versions: [INTERVIEW_RUBRIC_VERSION],
    })
    .eq("id", sessionId)
    .neq("status", "completed");
  if (error) throw error;
  await db
    .from("interview_processing_answers")
    .update({ status: "COMPLETED", completed_at: completedAt })
    .eq("mock_session_id", sessionId);
  await db
    .from("interview_videos")
    .update({
      status: "completed",
      completed_at: completedAt,
      processing_error: null,
    })
    .eq("mock_session_id", sessionId);
}

async function finalizeIndividualResult(
  db: Db,
  resultId: string,
  evaluation: QuestionEvaluationInput,
  mapping: Record<string, unknown>,
  answerId: string,
) {
  const aggregates = aggregateCompetencyScores([evaluation]);
  const { strongest, weakest } = strongestAndWeakestCompetencies(aggregates);
  const score = weightedQuestionScore(evaluation);
  const { data: result } = await db
    .from("interview_individual_results")
    .select("*")
    .eq("id", resultId)
    .single();
  if (!result) throw new Error("INDIVIDUAL_RESULT_NOT_FOUND");
  await db.from("interview_competency_aggregates").upsert(
    aggregates.map((item) => ({
      user_id: result.user_id,
      individual_result_id: resultId,
      competency_id: item.competencyId,
      score: item.score,
      questions_assessed: item.numberOfQuestionsAssessed,
    })),
    { onConflict: "individual_result_id,competency_id" },
  );
  await replaceRecommendations(db, {
    userId: result.user_id,
    resultId,
    specialty: result.specialty,
    priorities: weakest.map((item) => item.competencyId),
    excluded: [result.question_id],
  });
  const completedAt = new Date().toISOString();
  const { error } = await db
    .from("interview_individual_results")
    .update({
      status: "completed",
      completed_at: completedAt,
      practice_assessment: score,
      assessment_label: practiceAssessmentLabel(score),
      strongest_competency: strongest[0]?.competencyId ?? null,
      priority_development_competency: weakest[0]?.competencyId ?? null,
      rubric_id: mapping.rubric_id,
      rubric_key: mapping.rubric_key,
      rubric_version: mapping.rubric_version,
    })
    .eq("id", resultId)
    .neq("status", "completed");
  if (error) throw error;
  await db
    .from("interview_processing_answers")
    .update({ status: "COMPLETED", completed_at: completedAt })
    .eq("id", answerId);
  await db
    .from("interview_videos")
    .update({
      status: "completed",
      completed_at: completedAt,
      processing_error: null,
    })
    .eq("individual_result_id", resultId);
}

function normalizeEvaluation(
  evaluation: InterviewEvaluation,
  criteria: Array<{ competencyId: string; weight: number }>,
  applyCriticalCap: boolean,
): QuestionEvaluationInput {
  const safetyCriticalCompetencies = new Set([
    "patient-safety-orientation",
    "appropriate-escalation",
    "recognition-limits",
    "ethical-reasoning",
    "professionalism",
    "accountability",
  ]);
  return {
    questionId: "",
    rubricId: "",
    rubricVersion: INTERVIEW_RUBRIC_VERSION,
    strengths: evaluation.strengths,
    improvements: evaluation.improvements,
    competencyScores: criteria.map((criterion) => {
      const scored = evaluation.criteria.find(
        (item) => item.competencyId === criterion.competencyId,
      )!;
      const score: InterviewScore =
        applyCriticalCap &&
        evaluation.criticalElementsMissing.length &&
        safetyCriticalCompetencies.has(criterion.competencyId)
          ? (Math.min(scored.score, 2) as InterviewScore)
          : (scored.score as InterviewScore);
      return {
        competencyId: criterion.competencyId,
        weight: criterion.weight,
        score,
        evidence: scored.evidence,
        feedback: scored.missingForNextLevel,
      };
    }),
  };
}

function rowToEvaluationInput(
  row: Record<string, unknown>,
): QuestionEvaluationInput {
  return {
    questionId: String(row.question_id),
    rubricId: String(row.rubric_id),
    rubricVersion: String(row.rubric_version),
    strengths: row.strengths as string[],
    improvements: row.improvements as string[],
    competencyScores:
      row.competency_scores as QuestionEvaluationInput["competencyScores"],
  };
}

async function replaceRecommendations(
  db: Db,
  input: {
    userId: string;
    sessionId?: string;
    resultId?: string;
    specialty: string;
    priorities: string[];
    excluded: string[];
  },
) {
  const column = input.sessionId ? "mock_session_id" : "individual_result_id";
  const value = input.sessionId ?? input.resultId!;
  await db.from("interview_result_recommendations").delete().eq(column, value);
  const recommended = recommendInterviewQuestions({
    questions: interviewQuestions,
    priorityCompetencies: input.priorities,
    specialty: input.specialty as never,
    excludedQuestionIds: input.excluded,
  });
  if (recommended.length)
    await db.from("interview_result_recommendations").insert(
      recommended.map((question, index) => ({
        user_id: input.userId,
        mock_session_id: input.sessionId ?? null,
        individual_result_id: input.resultId ?? null,
        question_id: question.id,
        rank: index + 1,
        reason_competency_id: input.priorities[0] ?? question.competencies[0],
      })),
    );
}

export async function markAnswerFailed(
  db: Db,
  answerId: string,
  error: unknown,
) {
  const code =
    error instanceof Error ? error.message.slice(0, 100) : "PROCESSING_FAILED";
  await db
    .from("interview_processing_answers")
    .update({
      status: "FAILED",
      provider_error_code: code,
      user_error_message:
        "We could not analyse this answer. Your mock interview is safe; please retry processing.",
    })
    .eq("id", answerId);
}
