import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { requirePaidStudent } from "@/lib/auth/guards";
import {
  getInterviewPracticeArea,
  interviewQuestions,
  interviewSpecialties,
  type InterviewDifficulty,
  type InterviewQuestionType,
  type InterviewSpecialtyId,
} from "@/lib/interview/questions";

export default async function CompetencyQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ area: string }>;
  searchParams: Promise<{
    specialty?: string;
    type?: string;
    difficulty?: string;
  }>;
}) {
  const { area: areaId } = await params;
  const query = await searchParams;
  const returnTo = `/interview-practice/sessions/competency/${encodeURIComponent(areaId)}`;
  const { profile } = await requirePaidStudent(returnTo);
  const area = getInterviewPracticeArea(areaId);
  if (!area) notFound();
  const specialty = (query.specialty ?? "all") as InterviewSpecialtyId | "all";
  const type = (query.type ?? "all") as InterviewQuestionType | "all";
  const difficulty = (query.difficulty ?? "all") as InterviewDifficulty | "all";
  const questions = interviewQuestions.filter(
    (question) =>
      question.practiceArea === area.id &&
      (specialty === "all" ||
        question.specialtyRelevance.includes("general") ||
        question.specialtyRelevance.includes(specialty)) &&
      (type === "all" || question.questionType === type) &&
      (difficulty === "all" || question.difficulty === difficulty),
  );

  return (
    <AppShell title={area.title} name={profile.fullName}>
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6">
        <Link
          href="/interview-practice/sessions"
          className="text-sm font-bold text-blue-800"
        >
          ← All practice areas
        </Link>
        <h2 className="mt-3 text-3xl font-bold">{area.title}</h2>
        <p className="mt-2 max-w-3xl leading-7 text-slate-600">
          {area.description}
        </p>
      </div>
      <form className="mt-5 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-4">
        <FilterSelect
          name="specialty"
          label="Specialty"
          value={specialty}
          options={[
            { value: "all", label: "All specialties" },
            ...interviewSpecialties.map((item) => ({
              value: item.id,
              label: item.title,
            })),
          ]}
        />
        <FilterSelect
          name="type"
          label="Question type"
          value={type}
          options={[
            { value: "all", label: "All types" },
            { value: "general", label: "General" },
            { value: "behavioral", label: "Behavioral" },
            { value: "situational", label: "Situational" },
          ]}
        />
        <FilterSelect
          name="difficulty"
          label="Difficulty"
          value={difficulty}
          options={[
            { value: "all", label: "All levels" },
            { value: "foundational", label: "Foundational" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" },
          ]}
        />
        <button className="mt-auto min-h-11 rounded-lg bg-slate-950 px-5 font-bold text-white">
          Apply filters
        </button>
      </form>
      <p className="mt-5 text-sm font-semibold text-slate-600">
        {questions.length} matching questions
      </p>
      <ol className="mt-3 space-y-3">
        {questions.map((question, index) => (
          <li key={question.id}>
            <Link
              href={`/interview-practice/sessions/${question.legacyCategorySlug}/${question.legacyQuestionIndex}`}
              className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-400"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-900">
                {index + 1}
              </span>
              <span>
                <span className="font-bold text-slate-900">
                  {question.text}
                </span>
                <span className="mt-2 flex flex-wrap gap-2 text-xs font-semibold capitalize text-slate-600">
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    {question.questionType}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1">
                    {question.difficulty}
                  </span>
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </AppShell>
  );
}

function FilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="text-sm font-bold text-slate-700">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 font-normal"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
