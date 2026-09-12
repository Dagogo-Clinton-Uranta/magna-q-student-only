import type { Metadata } from "next";
import Link from "next/link";
import { InterviewResultRefresh } from "@/components/interview/interview-result-refresh";
import { AppShell } from "@/components/layout/app-shell";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewCreditBalance } from "@/lib/payments/interview-credits";
import { sanitizeReturnPath } from "@/lib/payments/return-path";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Interview payment status | Magna-Q",
};
export const dynamic = "force-dynamic";

export default async function InterviewCreditReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; session_id?: string }>;
}) {
  const profile = await requireRole(["student"]);
  const params = await searchParams;
  const returnTo = sanitizeReturnPath(params.returnTo, "/interview-practice");
  const sessionId =
    typeof params.session_id === "string" ? params.session_id : "";
  const { data: purchase } = sessionId
    ? await (
        await createClient()
      )
        .from("interview_credit_purchases")
        .select("status,product_kind,credit_quantity")
        .eq("user_id", profile.id)
        .eq("stripe_checkout_session_id", sessionId)
        .maybeSingle()
    : { data: null };
  const confirmed = purchase?.status === "paid";
  const balance = await getInterviewCreditBalance(profile.id);

  return (
    <AppShell title="Interview payment status" name={profile.fullName}>
      {!confirmed && <InterviewResultRefresh intervalMs={3_000} />}
      <div className="mx-auto mt-12 max-w-2xl border border-slate-200 bg-white p-8 text-center">
        <p className="eyebrow">
          {confirmed ? "Payment confirmed" : "Confirmation pending"}
        </p>
        <h2 className="mt-4 text-3xl font-normal tracking-[0.02em]">
          {confirmed
            ? "Your interview credits are ready."
            : "Stripe is confirming your payment."}
        </h2>
        <p className="mx-auto mt-4 max-w-lg leading-7 text-muted">
          {confirmed
            ? `${purchase.credit_quantity} ${purchase.product_kind === "competency_pack" ? "competency video credits" : "mock interview credit"} added to your account.`
            : "Credits appear after our server receives Stripe's signed confirmation. This usually takes only a few moments."}
        </p>
        <p className="mt-5 text-sm font-semibold text-slate-700">
          Available now: {balance.competencyAvailable} competency videos and{" "}
          {balance.mockCredits} mock sessions
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {confirmed ? (
            <Link href={returnTo} className="button-primary">
              Continue to practice
            </Link>
          ) : (
            <Link
              href={`/interview-practice/credits/return?session_id=${encodeURIComponent(sessionId)}&returnTo=${encodeURIComponent(returnTo)}`}
              className="button-primary"
            >
              Check again
            </Link>
          )}
          <Link href="/interview-practice/credits" className="button-secondary">
            View balance
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
