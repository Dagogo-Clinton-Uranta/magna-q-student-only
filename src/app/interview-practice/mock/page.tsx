import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { MockInterviewLauncher } from "@/components/interview/mock-interview-launcher";
import { requirePaidStudent } from "@/lib/auth/guards";

export default async function MockInterviewPage() {
  const { profile } = await requirePaidStudent("/interview-practice/mock");
  return (
    <AppShell title="Mock interview" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-5">
        <p className="eyebrow">Realistic practice · 8 questions</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Complete a competency-balanced mock interview
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Questions are selected across communication, motivation, teamwork,
          professionalism, reflection, patient safety, leadership, and career
          values. Coaching prompts stay hidden while the mock is active.
        </p>
      </WorkspaceHero>
      <MockInterviewLauncher />
      <p className="mt-5 text-sm leading-6 text-slate-600">
        Need focused preparation first?{" "}
        <Link
          href="/interview-practice/sessions"
          className="font-bold text-blue-800"
        >
          Practice by competency
        </Link>
      </p>
    </AppShell>
  );
}
