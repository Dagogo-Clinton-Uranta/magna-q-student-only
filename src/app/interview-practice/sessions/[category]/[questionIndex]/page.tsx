import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InterviewRecorder } from "@/components/interview/interview-recorder";
import { requirePaidStudent } from "@/lib/auth/guards";
import {
  getInterviewCategory,
  interviewQuestions,
} from "@/lib/interview/questions";

export default async function InterviewRecordingPage({
  params,
}: {
  params: Promise<{ category: string; questionIndex: string }>;
}) {
  const { category: categorySlug, questionIndex: rawIndex } = await params;
  const returnTo = `/interview-practice/sessions/${encodeURIComponent(categorySlug)}/${encodeURIComponent(rawIndex)}`;
  const { profile } = await requirePaidStudent(returnTo);
  const category = getInterviewCategory(categorySlug);
  const questionIndex = Number(rawIndex);
  const question = category?.questions[questionIndex];
  if (!category || !Number.isInteger(questionIndex) || !question) notFound();
  const modeledQuestion = interviewQuestions.find(
    (item) =>
      item.legacyCategorySlug === category.slug &&
      item.legacyQuestionIndex === questionIndex,
  );
  if (!modeledQuestion) notFound();
  return (
    <AppShell title="Video interview practice" name={profile.fullName}>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
          {category.title} · Question {questionIndex + 1} of{" "}
          {category.questions.length}
        </p>
        <Link
          href="/interview-practice/sessions"
          className="font-bold text-blue-800"
        >
          ← Choose another question
        </Link>
      </div>
      <InterviewRecorder
        categorySlug={category.slug}
        categoryTitle={category.title}
        questionId={modeledQuestion.id}
        question={question}
      />
    </AppShell>
  );
}
