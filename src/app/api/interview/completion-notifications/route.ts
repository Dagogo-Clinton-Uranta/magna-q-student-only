import { NextResponse } from "next/server";
import { getPaidStudentApiAccess } from "@/lib/payments/api-access";
import { createClient } from "@/lib/supabase/server";

const MAX_LOOKBACK_MS = 24 * 60 * 60 * 1_000;

export async function GET(request: Request) {
  const access = await getPaidStudentApiAccess("/interview-practice/results");
  if (!access.ok) return access.response;
  const requestedSince = Date.parse(
    new URL(request.url).searchParams.get("since") ?? "",
  );
  const earliest = Date.now() - MAX_LOOKBACK_MS;
  const since = new Date(
    Number.isFinite(requestedSince)
      ? Math.max(requestedSince, earliest)
      : Date.now() - 30_000,
  ).toISOString();
  const supabase = await createClient();
  const [{ data: individual }, { data: mocks }] = await Promise.all([
    supabase
      .from("interview_individual_results")
      .select("id,question_text,completed_at")
      .eq("user_id", access.profile.id)
      .eq("status", "completed")
      .gt("completed_at", since)
      .order("completed_at", { ascending: true }),
    supabase
      .from("interview_mock_sessions")
      .select("id,specialty,completed_at")
      .eq("user_id", access.profile.id)
      .eq("status", "completed")
      .gt("completed_at", since)
      .order("completed_at", { ascending: true }),
  ]);

  return NextResponse.json({
    notifications: [
      ...(individual ?? []).map((result) => ({
        id: `individual:${result.id}`,
        title: "Your interview answer is ready",
        body: `Analysis is complete for “${result.question_text}”.`,
        href: `/interview-practice/results/practice/${result.id}`,
        completedAt: result.completed_at,
      })),
      ...(mocks ?? []).map((session) => ({
        id: `mock:${session.id}`,
        title: "Your mock interview analysis is ready",
        body: `All eight ${String(session.specialty).replaceAll("-", " ")} interview answers have been analysed.`,
        href: `/interview-practice/results/mock/${session.id}`,
        completedAt: session.completed_at,
      })),
    ].sort(
      (left, right) =>
        Date.parse(left.completedAt ?? "") -
        Date.parse(right.completedAt ?? ""),
    ),
  });
}
