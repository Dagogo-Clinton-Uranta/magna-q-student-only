import type { Metadata } from "next";
import Link from "next/link";
import { createInterviewCreditCheckout } from "@/app/interview-practice/credits/actions";
import { InterviewCreditSummary } from "@/components/interview/interview-credit-summary";
import { AppShell } from "@/components/layout/app-shell";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { requireRole } from "@/lib/auth/guards";
import { getInterviewCreditBalance } from "@/lib/payments/interview-credits";
import { sanitizeReturnPath } from "@/lib/payments/return-path";

export const metadata: Metadata = {
  title: "Interview practice packs | Magna-Q",
};

export const dynamic = "force-dynamic";

export default async function InterviewCreditsPage({
  searchParams,
}: {
  searchParams: Promise<{
    product?: string;
    returnTo?: string;
    canceled?: string;
    error?: string;
  }>;
}) {
  const profile = await requireRole(["student"]);
  const balance = await getInterviewCreditBalance(profile.id);
  const params = await searchParams;
  const returnTo = sanitizeReturnPath(params.returnTo, "/interview-practice");

  return (
    <AppShell title="Interview practice packs" name={profile.fullName}>
      <div className="mx-auto mt-7 max-w-5xl">
        <p className="eyebrow">Simple pay-as-you-practice pricing</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-normal tracking-[0.02em] text-ink">
          Your first three competency videos and their analyses are free.
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          After the free allowance, choose a ten-video competency pack for $10
          or purchase an eight-question mock interview for $5. Credits do not
          renew automatically.
        </p>

        <InterviewCreditSummary balance={balance} compact />

        {params.canceled === "1" && (
          <p
            role="status"
            className="mt-5 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            Checkout was canceled. You have not been charged.
          </p>
        )}
        {params.error && (
          <p
            role="alert"
            className="mt-5 border border-red-300 bg-red-50 p-4 text-sm text-red-900"
          >
            {params.error}
          </p>
        )}

        <section
          className="mt-7 grid gap-5 md:grid-cols-2"
          aria-label="Interview products"
        >
          <PriceOption
            title="Competency practice pack"
            price="$10"
            detail="10 individual Practice by Competency videos, with one analysis for each video."
            product="competency_pack"
            returnTo={returnTo}
            featured={params.product !== "mock_interview"}
          />
          <PriceOption
            title="Mock interview"
            price="$5"
            detail="One complete mock interview: 8 recorded answers followed by the session analysis."
            product="mock_interview"
            returnTo={returnTo}
            featured={params.product === "mock_interview"}
          />
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={returnTo} className="button-secondary">
            Back to interview practice
          </Link>
          <Link href="/interview-practice/results" className="button-secondary">
            View existing analyses
          </Link>
        </div>
        <p className="mt-5 text-xs leading-5 text-slate-500">
          Stripe securely handles card details. Credits are added only after
          Magna-Q receives Stripe&apos;s signed payment confirmation.
        </p>
      </div>
    </AppShell>
  );
}

function PriceOption({
  title,
  price,
  detail,
  product,
  returnTo,
  featured,
}: {
  title: string;
  price: string;
  detail: string;
  product: "competency_pack" | "mock_interview";
  returnTo: string;
  featured: boolean;
}) {
  return (
    <article
      className={`border bg-white p-6 ${featured ? "border-emerald-500" : "border-slate-200"}`}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
        One-time purchase
      </p>
      <div className="mt-3 flex items-baseline justify-between gap-3">
        <h3 className="text-xl font-bold text-slate-950">{title}</h3>
        <span className="text-3xl font-bold text-blue-950">{price}</span>
      </div>
      <p className="mt-4 min-h-16 text-sm leading-6 text-slate-600">{detail}</p>
      <form action={createInterviewCreditCheckout} className="mt-5">
        <input type="hidden" name="product" value={product} />
        <input type="hidden" name="returnTo" value={returnTo} />
        <FormSubmitButton
          pendingLabel="Opening secure checkout…"
          className="button-primary w-full"
        >
          Purchase with Stripe
        </FormSubmitButton>
      </form>
    </article>
  );
}
