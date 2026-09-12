import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { InterviewRecorder } from "@/components/interview/interview-recorder";
import { InterviewCreditSummary } from "@/components/interview/interview-credit-summary";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewCreditBalance } from "@/lib/payments/interview-credits";
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
  const profile = await requireRole(["student"]);
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
  const balance = await getInterviewCreditBalance(profile.id);
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
      <InterviewCreditSummary balance={balance} compact />
      {balance.competencyAvailable > 0 ? (
        <InterviewRecorder
          categorySlug={category.slug}
          categoryTitle={category.title}
          questionId={modeledQuestion.id}
          question={question}
        />
      ) : (
        <section className="mt-6 border border-amber-300 bg-amber-50 p-6 text-amber-950">
          <h2 className="text-xl font-bold">
            A competency video credit is required
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6">
            You have used all three free videos and analyses. A $10 pack adds
            ten more individual videos and their analyses.
          </p>
          <Link
            href={`/interview-practice/credits?product=competency_pack&returnTo=${encodeURIComponent(returnTo)}`}
            className="button-primary mt-5"
          >
            Purchase 10-video pack
          </Link>
        </section>
      )}
    </AppShell>
  );
}
