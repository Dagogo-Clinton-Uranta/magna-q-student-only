import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { GoBackButton } from "@/components/payments/go-back-button";
import { buttonStyles } from "@/components/ui/button";
import { Surface } from "@/components/ui/surface";
import { getStudentEntitlement, requireRole } from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";

export default async function SubscriptionRequiredPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; canceled?: string }>;
}) {
  const profile = await requireRole(["student"]);
  const params = await searchParams;
  const returnTo = sanitizeReturnPath(params.returnTo);
  const entitlement = await getStudentEntitlement(profile);
  if (entitlement.hasAccess) redirect(returnTo);

  const subscribeHref = `/subscribe?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <AppShell title="Subscription required" name={profile.fullName}>
      <div className="mx-auto mt-10 max-w-2xl">
        {params.canceled === "true" && (
          <p
            role="status"
            className="mb-4 border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"
          >
            Payment was canceled. You have not been charged.
          </p>
        )}
        <Surface tone="soft" className="p-6 sm:p-10">
          <p className="eyebrow">Paid student feature</p>
          <h2 className="mt-4 text-2xl tracking-[0.02em] sm:text-3xl">
            You need to pay to use this feature
          </h2>
          <p className="mt-4 max-w-xl leading-7 text-muted">
            A $100 monthly Magna-Q subscription unlocks practice tests, video
            interview practice, and student chat rooms.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={subscribeHref} className={buttonStyles({ size: "lg" })}>
              Pay now
            </Link>
            <GoBackButton />
          </div>
        </Surface>
      </div>
    </AppShell>
  );
}
