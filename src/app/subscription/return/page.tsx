import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Surface } from "@/components/ui/surface";
import { getStudentEntitlement, requireRole } from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";

export const metadata: Metadata = {
  title: "Subscription status | Magna-Q",
};

export const dynamic = "force-dynamic";

export default async function SubscriptionReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; session_id?: string }>;
}) {
  const profile = await requireRole(["student"]);
  const entitlement = await getStudentEntitlement(profile);
  const returnTo = sanitizeReturnPath((await searchParams).returnTo);

  return (
    <AppShell title="Subscription status" name={profile.fullName}>
      <div className="mx-auto mt-12 max-w-2xl">
        <Surface
          tone={entitlement.hasAccess ? "soft" : "default"}
          className="p-7 text-center sm:p-10"
        >
          <div
            aria-hidden="true"
            className={`mx-auto grid h-14 w-14 place-items-center border text-2xl ${
              entitlement.hasAccess
                ? "border-brand-700 bg-white text-brand-700"
                : "border-line bg-field text-muted"
            }`}
          >
            {entitlement.hasAccess ? "✓" : "…"}
          </div>
          <p className="eyebrow mt-6">
            {entitlement.hasAccess
              ? "Payment confirmed"
              : "Confirmation pending"}
          </p>
          <h2 className="mt-4 text-3xl font-normal tracking-[0.02em]">
            {entitlement.hasAccess
              ? "Your student features are ready."
              : "Stripe is confirming your subscription."}
          </h2>
          <p className="mx-auto mt-4 max-w-lg leading-7 text-muted">
            {entitlement.hasAccess
              ? "You now have access to practice tests, video interview practice, and chat rooms for the current paid period."
              : "Payment access is activated only after our server receives Stripe's signed confirmation. This usually takes a few moments—refresh this page shortly."}
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {entitlement.hasAccess ? (
              <Link href={returnTo} className="button-primary">
                Continue to feature
              </Link>
            ) : (
              <Link
                href={`/subscription/return?returnTo=${encodeURIComponent(returnTo)}`}
                className="button-primary"
              >
                Check again
              </Link>
            )}
            <Link href="/dashboard" className="button-secondary">
              Student dashboard
            </Link>
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
