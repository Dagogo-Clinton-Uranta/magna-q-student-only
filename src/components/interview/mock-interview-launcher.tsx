"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { interviewSpecialties } from "@/lib/interview/questions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import Link from "next/link";

export function MockInterviewLauncher({
  mockCredits,
}: {
  mockCredits: number;
}) {
  const router = useRouter();
  const [specialty, setSpecialty] = useState("general");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function start() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/interview/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty }),
      });
      const result = (await response.json()) as {
        href?: string;
        paywallUrl?: string;
        error?: string;
      };
      if (response.status === 402 && result.paywallUrl) {
        router.push(result.paywallUrl);
        return;
      }
      if (!response.ok || !result.href)
        throw new Error(
          result.error ?? "The mock interview could not be started.",
        );
      router.push(result.href);
    } catch (startError) {
      setError(
        startError instanceof Error ? startError.message : "Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
      {mockCredits < 1 ? (
        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Purchase a mock interview to begin
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            One $5 credit covers the complete eight-question mock interview and
            its analysis. Starting the session uses one mock credit.
          </p>
          <Link
            href="/interview-practice/credits?product=mock_interview&returnTo=%2Finterview-practice%2Fmock"
            className="button-primary mt-5"
          >
            Purchase $5 mock interview
          </Link>
        </div>
      ) : (
        <>
          <label
            htmlFor="mock-specialty"
            className="block font-bold text-slate-900"
          >
            Specialty context
          </label>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The core remains universal. Your specialty influences eligible
            questions without dominating the interview. Beginning uses one of
            your {mockCredits} available mock{" "}
            {mockCredits === 1 ? "credit" : "credits"}.
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <select
              id="mock-specialty"
              value={specialty}
              onChange={(event) => setSpecialty(event.target.value)}
              className="min-h-12 flex-1 rounded-lg border border-slate-300 bg-white px-4"
            >
              {interviewSpecialties.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void start()}
              disabled={loading}
              className="button-primary min-w-48 disabled:opacity-60"
            >
              {loading ? (
                <LoadingSpinner size="sm" label="Starting mock interview" />
              ) : (
                "Begin 8-question mock"
              )}
            </button>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}
        </>
      )}
    </div>
  );
}
