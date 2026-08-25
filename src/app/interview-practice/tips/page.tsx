import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { InterviewTipsAccordion } from "@/components/interview/interview-tips-accordion";
import { requireResidencyStageStudent } from "@/lib/auth/guards";

export default async function InterviewTipsPage() {
  const { profile } = await requireResidencyStageStudent(
    "/interview-practice/tips",
  );
  return (
    <AppShell title="Common interview tips" name={profile.fullName}>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-3xl text-slate-700">
          Open each question for a practical way to think about your answer.
          Rehearse the idea in your own words rather than memorizing a script.
        </p>
        <Link href="/interview-practice" className="font-bold text-blue-800">
          ← Interview practice
        </Link>
      </div>
      <section className="mt-7">
        <InterviewTipsAccordion />
      </section>
      <section className="mt-10 border-t border-slate-200 pt-8">
        <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
          Video learning
        </p>
        <h2 className="mt-2 text-2xl font-bold">
          Get thinking about the interview
        </h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <VideoEmbed
            title="Residency interview preparation video one"
            videoId="qSfX4LbzXwA"
          />
          <VideoEmbed
            title="Residency interview preparation video two"
            videoId="KilQlupCWYg"
          />
        </div>
      </section>
    </AppShell>
  );
}

function VideoEmbed({ title, videoId }: { title: string; videoId: string }) {
  return (
    <div className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm">
      <iframe
        className="h-full w-full"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}
