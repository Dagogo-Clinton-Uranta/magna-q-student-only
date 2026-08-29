import { createClient } from "@supabase/supabase-js";
import { interviewQuestions } from "../src/lib/interview/questions";
import { competencyById, INTERVIEW_RUBRIC_VERSION, rubricFamilyForQuestion } from "../src/lib/interview/rubric-catalog";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.");
  if (interviewQuestions.length !== 162)
    throw new Error(`Expected the application's 162 questions; found ${interviewQuestions.length}. No rows were written.`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data: rubrics, error: rubricError } = await supabase
  .from("interview_rubrics")
  .select("id,rubric_key,version")
  .eq("version", INTERVIEW_RUBRIC_VERSION);
if (rubricError) throw rubricError;
  const rubricIds = new Map((rubrics ?? []).map((rubric) => [rubric.rubric_key, rubric.id]));

  const rows = interviewQuestions.map((question) => {
  const family = rubricFamilyForQuestion(question);
  const rubricId = rubricIds.get(family.id);
  if (!rubricId) throw new Error(`Missing persisted rubric ${family.id}@${INTERVIEW_RUBRIC_VERSION}.`);
  const weight = family.criteria.reduce((sum, item) => sum + item.weight, 0);
  if (Math.abs(weight - 1) > 0.000001) throw new Error(`Weights for ${question.id} total ${weight}.`);
  const criteria = family.criteria.map((criterion) => {
    const competency = competencyById(criterion.competencyId);
    if (!competency) throw new Error(`Orphan competency ${criterion.competencyId} on ${question.id}.`);
    return { ...criterion, name: competency.name, anchors: competency.anchors };
  });
  return {
    question_id: question.id,
    practice_area: question.practiceArea,
    question_type: question.questionType,
    competencies: question.competencies,
    specialty_relevance: question.specialtyRelevance,
    rubric_id: rubricId,
    rubric_key: family.id,
    rubric_version: INTERVIEW_RUBRIC_VERSION,
    criteria,
    critical_elements: family.criticalElements ?? [],
    red_flags: family.concerns,
  };
  });
  const { error } = await supabase.from("interview_question_rubric_mappings").upsert(rows, { onConflict: "question_id" });
  if (error) throw error;
  console.log(JSON.stringify({ mappedQuestions: rows.length, rubricVersion: INTERVIEW_RUBRIC_VERSION, orphanCompetencies: 0, invalidWeightTotals: 0 }));
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
