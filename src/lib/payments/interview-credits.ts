import "server-only";

import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const FREE_COMPETENCY_VIDEO_LIMIT = 3;

export type InterviewCreditBalance = {
  freeUsed: number;
  freeRemaining: number;
  competencyCredits: number;
  competencyAvailable: number;
  mockCredits: number;
};

export async function getInterviewCreditBalance(
  userId: string,
): Promise<InterviewCreditBalance> {
  if (DEMO_AUTH_BYPASS_ENABLED && userId === "demo-student")
    return {
      freeUsed: 0,
      freeRemaining: FREE_COMPETENCY_VIDEO_LIMIT,
      competencyCredits: 10,
      competencyAvailable: 13,
      mockCredits: 1,
    };

  const { data, error } = await createServiceRoleClient()
    .from("profiles")
    .select(
      "interview_free_competency_used,interview_competency_credits,interview_mock_credits",
    )
    .eq("id", userId)
    .single();
  if (error || !data)
    throw error ?? new Error("Interview credit balance was not found.");

  const freeUsed = Number(data.interview_free_competency_used);
  const freeRemaining = Math.max(0, FREE_COMPETENCY_VIDEO_LIMIT - freeUsed);
  const competencyCredits = Number(data.interview_competency_credits);
  return {
    freeUsed,
    freeRemaining,
    competencyCredits,
    competencyAvailable: freeRemaining + competencyCredits,
    mockCredits: Number(data.interview_mock_credits),
  };
}
