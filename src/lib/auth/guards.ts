import { cache } from "react";
import { redirect } from "next/navigation";
import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";
import { PAYMENTS_ENABLED } from "@/config/features";
import { sanitizeReturnPath } from "@/lib/payments/return-path";
import { normalizeLocale, type AppLocale } from "@/lib/i18n/config";
import type { StudentStage } from "@/lib/stages";
import { createClient } from "@/lib/supabase/server";

export type UserRole = "student";

export type CurrentProfile = {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  onboardingCompleted: boolean;
  studyStage: StudentStage;
  targetExam: "step1" | "step2ck" | "step3";
  monthlyPayment: "paid" | "unpaid";
  preferredLocale: AppLocale;
};

export type StudentEntitlement = {
  hasAccess: boolean;
  currentPeriodEnd: string | null;
};

export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
});

export const getCurrentProfile = cache(
  async (): Promise<CurrentProfile | null> => {
    if (DEMO_AUTH_BYPASS_ENABLED) {
      return {
        id: "demo-student",
        fullName: "Demo Student",
        username: "demo_student",
        role: "student",
        onboardingCompleted: true,
        studyStage: "step2ck",
        targetExam: "step2ck",
        // Demo authentication is explicitly enabled by an environment flag and
        // has no corresponding billing row. Keep product demos usable without
        // weakening normal production accounts.
        monthlyPayment: "paid",
        preferredLocale: "en",
      };
    }
    const user = await getCurrentUser();
    if (!user) return null;
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, role, onboarding_completed, study_stage, target_exam, monthly_payment, preferred_locale",
      )
      .eq("id", user.id)
      .maybeSingle();
    if (error || !data || data.role !== "student") return null;
    return {
      id: data.id as string,
      fullName: data.full_name as string,
      username: data.username as string,
      role: data.role as UserRole,
      onboardingCompleted: data.onboarding_completed as boolean,
      studyStage: (data.study_stage ?? data.target_exam) as StudentStage,
      targetExam: data.target_exam as CurrentProfile["targetExam"],
      monthlyPayment: data.monthly_payment as CurrentProfile["monthlyPayment"],
      preferredLocale: normalizeLocale(data.preferred_locale),
    };
  },
);

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireOnboardedProfile() {
  const profile = await getCurrentProfile();
  if (!profile) await requireUser();
  if (!profile?.onboardingCompleted) redirect("/onboarding");
  return profile;
}

export async function requireRole(allowed: readonly UserRole[]) {
  const profile = await requireOnboardedProfile();
  if (!allowed.includes(profile.role)) redirect(profileHome(profile.role));
  return profile;
}

/**
 * Resolves the student's current paid period from our webhook-maintained
 * billing projection. The local database—not a success URL in the browser—is
 * authoritative because Stripe renewals and failures happen asynchronously.
 */
export async function getStudentEntitlement(
  profile: CurrentProfile,
): Promise<StudentEntitlement> {
  // Free-access period: retain the complete billing implementation below so
  // setting PAYMENTS_ENABLED=true reinstates the paywalls in one step.
  if (!PAYMENTS_ENABLED && profile.role === "student")
    return {
      hasAccess: true,
      currentPeriodEnd: new Date(
        Date.now() + 12 * 60 * 60 * 1000,
      ).toISOString(),
    };
  if (DEMO_AUTH_BYPASS_ENABLED && profile.id === "demo-student")
    return {
      hasAccess: true,
      currentPeriodEnd: new Date(
        Date.now() + 12 * 60 * 60 * 1000,
      ).toISOString(),
    };
  if (profile.role !== "student" || profile.monthlyPayment !== "paid")
    return { hasAccess: false, currentPeriodEnd: null };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("status,current_period_start,current_period_end")
    .eq("user_id", profile.id)
    .maybeSingle();
  if (error || !data?.current_period_end)
    return { hasAccess: false, currentPeriodEnd: null };

  const currentPeriodEnd = String(data.current_period_end);
  const currentPeriodStart = String(data.current_period_start);
  return {
    hasAccess:
      data.status === "active" &&
      Number.isFinite(Date.parse(currentPeriodStart)) &&
      Date.parse(currentPeriodStart) <= Date.now() &&
      Number.isFinite(Date.parse(currentPeriodEnd)) &&
      Date.parse(currentPeriodEnd) > Date.now(),
    currentPeriodEnd,
  };
}

/** Redirects unpaid students before rendering any paid feature page. */
export async function requirePaidStudent(returnTo: string) {
  const profile = await requireRole(["student"]);
  const entitlement = await getStudentEntitlement(profile);
  if (!entitlement.hasAccess) {
    const safeReturnTo = sanitizeReturnPath(returnTo);
    redirect(
      `/subscription-required?returnTo=${encodeURIComponent(safeReturnTo)}`,
    );
  }
  return { profile, entitlement };
}

export function profileHome(role: UserRole) {
  void role;
  return "/dashboard" as const;
}
