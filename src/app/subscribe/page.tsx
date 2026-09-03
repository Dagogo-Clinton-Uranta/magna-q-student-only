import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createSubscriptionCheckout } from "@/app/subscribe/actions";
import { AppShell } from "@/components/layout/app-shell";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { Surface } from "@/components/ui/surface";
import { getStudentEntitlement, requireRole } from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";

export const metadata: Metadata = {
  title: "Student subscription | Magna-Q",
  description: "Subscribe for practice tests, interview practice, and chat.",
};

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{
    returnTo?: string;
    canceled?: string;
    error?: string;
  }>;
}) {
  const profile = await requireRole(["student"]);
  const entitlement = await getStudentEntitlement(profile);
  const params = await searchParams;
  const returnTo = sanitizeReturnPath(params.returnTo);
  if (entitlement.hasAccess) redirect(returnTo);

  return (
    <AppShell title="Student subscription" name={profile.fullName}>
      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)]">
        <Surface tone="soft" className="p-6 sm:p-8 lg:p-10">
          <p className="eyebrow">One monthly membership</p>
          <h2 className="mt-4 max-w-2xl text-3xl font-normal leading-tight tracking-[0.02em] sm:text-4xl">
            Prepare, practice, and learn with your community.
          </h2>
          <p className="mt-4 max-w-2xl leading-7 text-muted">
            Your subscription renews monthly and unlocks the three core student
            preparation experiences.
          </p>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            <Feature
              index="1"
              title="Practice tests"
              detail="Build and complete USMLE question blocks."
            />
            <Feature
              index="2"
              title="Video interviews"
              detail="Record and review residency interview practice."
            />
            <Feature
              index="3"
              title="Chat rooms"
              detail="Connect with the Magna-Q student community."
            />
          </ul>
        </Surface>

        <Surface className="p-6 sm:p-8">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Magna-Q student plan
          </p>
          <div className="mt-5 flex items-end gap-2 border-b border-line pb-6">
            <span className="text-4xl font-normal tracking-[0.02em] text-ink">
              $100
            </span>
            <span className="pb-1 text-sm text-muted">USD / month</span>
          </div>
          <p className="mt-6 text-sm leading-6 text-muted">
            You will enter your card and billing details on Stripe&apos;s secure
            hosted checkout. Your subscription renews automatically each month.
          </p>

          {params.canceled === "1" && (
            <div
              role="status"
              className="mt-5 border border-brand-300 bg-brand-50 p-4 text-sm text-brand-950"
            >
              Checkout was canceled. You have not been charged.
            </div>
          )}
          {params.error && (
            <div
              role="alert"
              className="mt-5 border border-red-300 bg-red-50 p-4 text-sm text-red-900"
            >
              {params.error}
            </div>
          )}

          <form action={createSubscriptionCheckout} className="mt-6">
            <input type="hidden" name="returnTo" value={returnTo} />
            <FormSubmitButton
              pendingLabel="Opening secure checkout…"
              className="button-primary w-full"
            >
              Continue to secure payment
            </FormSubmitButton>
          </form>
          <Link href={returnTo} className="button-secondary mt-3 w-full">
            Go back
          </Link>
          <p className="mt-5 text-center text-xs leading-5 text-muted">
            Payment details are handled by Stripe. Access is activated after
            Stripe confirms payment securely with Magna-Q.
          </p>
        </Surface>
      </div>
    </AppShell>
  );
}

function Feature({
  index,
  title,
  detail,
}: {
  index: string;
  title: string;
  detail: string;
}) {
  return (
    <li className="border-t border-brand-300 pt-4">
      <span className="text-xs tracking-[0.16em] text-brand-700">{index}</span>
      <h3 className="mt-3 text-lg">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
    </li>
  );
}
