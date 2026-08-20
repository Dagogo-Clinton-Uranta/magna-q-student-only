import "server-only";

import { NextResponse } from "next/server";
import { getCurrentProfile, getStudentEntitlement } from "@/lib/auth/guards";
import { sanitizeReturnPath } from "@/lib/payments/return-path";

/**
 * Enforces the same paid-student rule on Route Handlers as the page guard.
 * A 402 response blocks direct API use and gives clients a safe paywall URL.
 */
export async function getPaidStudentApiAccess(returnTo: string) {
  const profile = await getCurrentProfile();
  if (!profile)
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  if (profile.role !== "student")
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Student role required." },
        { status: 403 },
      ),
    };

  const entitlement = await getStudentEntitlement(profile);
  if (!entitlement.hasAccess) {
    const safeReturnTo = sanitizeReturnPath(returnTo);
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "A current monthly subscription is required.",
          code: "PAYMENT_REQUIRED",
          paywallUrl: `/subscription-required?returnTo=${encodeURIComponent(safeReturnTo)}`,
        },
        { status: 402 },
      ),
    };
  }

  return { ok: true as const, profile, entitlement };
}
