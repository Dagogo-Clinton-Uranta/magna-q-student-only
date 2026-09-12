import Link from "next/link";
import type { InterviewCreditBalance } from "@/lib/payments/interview-credits";

export function InterviewCreditSummary({
  balance,
  compact = false,
}: {
  balance: InterviewCreditBalance;
  compact?: boolean;
}) {
  return (
    <section
      className={`${compact ? "mt-4" : "mt-6"} border border-slate-200 bg-white p-5`}
      aria-label="Interview practice balance"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-800">
            Your interview balance
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {balance.freeRemaining > 0
              ? `${balance.freeRemaining} of 3 free competency videos and analyses remaining`
              : "All 3 free competency videos and analyses have been used"}
          </p>
        </div>
        <dl className="flex gap-6 text-right">
          <div>
            <dt className="text-xs text-slate-500">Pack videos</dt>
            <dd className="text-2xl font-bold text-slate-950">
              {balance.competencyCredits}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Mock sessions</dt>
            <dd className="text-2xl font-bold text-slate-950">
              {balance.mockCredits}
            </dd>
          </div>
        </dl>
      </div>
      {!compact && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <p className="mr-auto text-sm text-slate-600">
            10 competency videos + analyses: <strong>$10</strong>. One
            8-question mock + analysis: <strong>$5</strong>.
          </p>
          <Link href="/interview-practice/credits" className="button-secondary">
            View packs
          </Link>
        </div>
      )}
    </section>
  );
}
