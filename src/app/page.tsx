import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/public/site-header";
import { Reveal } from "@/components/ui/motion";
import { appConfig } from "@/config/app";
import {
  featurePortraitPosition,
  type CommunityFeature,
} from "@/lib/features/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: `${appConfig.name} | From licensing exams to the Match`,
  description: appConfig.description,
  openGraph: {
    title: appConfig.name,
    description: appConfig.description,
    type: "website",
    siteName: appConfig.name,
  },
};

const journey = [
  {
    step: "1",
    title: "Master your licensing exams",
    description:
      "Build focused Step 1, Step 2 CK, and Step 3 practice blocks with clear explanations and progress analytics.",
  },
  {
    step: "2",
    title: "Prepare your application",
    description:
      "Learn the residency timeline, strengthen your story, and organize the milestones that move an application forward.",
  },
  {
    step: "3",
    title: "Practice every interview",
    description:
      "Record realistic answers, review your delivery, and build confidence before speaking with programs.",
  },
  {
    step: "4",
    title: "Navigate the Match",
    description:
      "Understand ranking, communication, and the final steps from completed interviews to Match Day.",
  },
];

const features = [
  [
    "Personalised practice",
    "Create question blocks around your exam, subject, system, and previous performance.",
  ],
  [
    "Physician-reviewed learning",
    "Study explanations and clinical context through a visible review and publication workflow.",
  ],
  [
    "Interview rehearsal",
    "Practice out loud with structured prompts, playback, and guided feedback.",
  ],
  [
    "Residency roadmap",
    "Follow practical timelines and guidance from application preparation through matching.",
  ],
  [
    "One progress view",
    "See your exam work, active blocks, resources, and next steps in a single workspace.",
  ],
  [
    "Built for real schedules",
    "Use a responsive, low-friction experience during rotations, commutes, and focused study.",
  ],
];

const faqs = [
  [
    "What parts of the medical career journey are covered?",
    "Magna-Q brings together USMLE preparation, residency guidance, interview practice, and Match support in one learning workspace.",
  ],
  [
    "Can I use Magna-Q outside Africa?",
    "Yes. The platform is designed for international medical graduates everywhere, with particular attention to the challenges of navigating an unfamiliar licensing and residency system.",
  ],
  [
    "Is the educational content medical advice?",
    "No. Magna-Q is an educational preparation platform and does not replace clinical supervision, current guidelines, or professional medical advice.",
  ],
  [
    "Can I study on my phone?",
    "Yes. Core workflows are responsive, keyboard accessible, and designed to remain usable on slower connections.",
  ],
];

export default async function HomePage() {
  const supabase = await createClient();
  const { data: rawSpotlight } = await supabase
    .from("community_features")
    .select("*")
    .eq("front_page_feature", true)
    .maybeSingle();
  const spotlight = rawSpotlight as CommunityFeature | null;
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="overflow-hidden border-b border-line bg-canvas">
          <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24 lg:pb-20">
            <Reveal>
              <div className="tag-outline mx-auto border-brand-200 bg-brand-50 text-brand-700">
                <span className="h-2 w-2 rounded-full bg-brand-500" />
                Your complete path to residency
              </div>
              <h1 className="mx-auto mt-8 max-w-5xl text-4xl font-normal leading-tight tracking-[0.01em] text-ink sm:text-6xl lg:text-7xl">
                From your first licensing exam to the moment you match.
              </h1>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                One connected platform for exam preparation, residency guidance,
                interview practice, and the confidence to take your next step.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/login?as=student"
                  className="button-primary min-h-12 px-6"
                >
                  Start your journey
                </Link>
                <Link
                  href="#journey"
                  className="button-secondary min-h-12 px-6"
                >
                  See how it works
                </Link>
              </div>
            </Reveal>
            <Reveal className="mt-14" delay={0.08}>
              <div className="overflow-hidden border border-line bg-field shadow-lift">
                <Image
                  src="/images/medinexus-journey-hero.png"
                  alt="An international medical graduate progressing from exam uncertainty to confident residency preparation and a successful match"
                  width={1672}
                  height={941}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="journey"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
        >
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">One journey, one workspace</p>
              <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
                Know what to do now—and what comes next.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                Replace scattered resources and uncertain next steps with a
                clear, supported path from preparation to residency.
              </p>
            </div>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {journey.map((item, index) => (
              <Reveal key={item.step} delay={index * 0.05}>
                <article className="card h-full p-6">
                  <span className="grid h-10 w-10 place-items-center bg-soft text-sm font-normal text-brand-700">
                    {item.step}
                  </span>
                  <h3 className="mt-5 text-lg font-normal tracking-[0.02em] text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    {item.description}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="difference" className="border-y border-line bg-soft">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:py-28">
            <Reveal>
              <div className="overflow-hidden border border-line bg-white shadow-card">
                <Image
                  src="/images/usmle-guidelines-hero.png"
                  alt="Medical student organising a clear study plan for licensing exams and residency"
                  width={1672}
                  height={941}
                  className="h-full w-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="eyebrow">Clarity over overwhelm</p>
              <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
                Turn uncertainty into a plan you can follow.
              </h2>
              <p className="mt-5 text-lg leading-8 text-body">
                International graduates are often expected to piece together
                exam, application, and interview knowledge alone. Magna-Q makes
                the hidden context visible and connects every stage.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Focused study instead of information overload",
                  "US clinical and residency context explained clearly",
                  "Progress that turns into an actionable next step",
                ].map((item) => (
                  <li key={item} className="flex gap-3 text-body">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white text-sm text-brand-700">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section
          id="features"
          className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28"
        >
          <Reveal className="text-center">
            <p className="eyebrow">Everything works together</p>
            <h2 className="mx-auto mt-4 max-w-3xl text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
              Preparation designed around your whole goal.
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(([title, description], index) => (
              <Reveal key={title} delay={(index % 3) * 0.05}>
                <article>
                  <span className="grid h-12 w-12 place-items-center border border-brand-200 bg-soft text-brand-700">
                    <FeatureIcon index={index} />
                  </span>
                  <h3 className="mt-5 text-lg font-normal tracking-[0.02em] text-ink">
                    {title}
                  </h3>
                  <p className="mt-2 leading-7 text-muted">{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {spotlight && (
          <section className="border-y border-line bg-soft">
            <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
              <Reveal>
                <div className="max-w-4xl">
                  <p className="eyebrow">Community, brought forward</p>
                  <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
                    Your next collaborator may already be here.
                  </h2>
                  <p className="mt-5 text-lg leading-8 text-muted">
                    At every stage of the licensing process, Magna-Q gives
                    students and doctors a place to share meaningful work, find
                    their people, and move from the background to the center of
                    the community.
                  </p>
                </div>
              </Reveal>
              <Reveal className="mt-10" delay={0.08}>
                <article className="grid overflow-hidden border border-line bg-field shadow-lift lg:grid-cols-[1.05fr_.95fr]">
                  <div className="min-h-80 overflow-hidden bg-canvas">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spotlight.image_url}
                      alt={spotlight.image_alt_text}
                      className={`h-full min-h-80 w-full object-cover ${featurePortraitPosition(spotlight.id)}`}
                    />
                  </div>
                  <div className="flex flex-col justify-center p-7 sm:p-10">
                    <p className="text-xs font-bold uppercase tracking-widest text-brand-700">
                      This week&apos;s top feature
                    </p>
                    <h3 className="mt-3 text-2xl font-normal leading-snug text-ink sm:text-3xl">
                      {spotlight.title}
                    </h3>
                    <blockquote className="mt-5 border-l-2 border-brand-500 pl-4 text-lg italic leading-8 text-brand-900">
                      “{spotlight.representative_quote}”
                    </blockquote>
                    <p className="mt-5 line-clamp-4 leading-7 text-muted">
                      {spotlight.summary}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
                      <span className="font-semibold text-brand-800">
                        @{spotlight.username}
                      </span>
                      <Link
                        href={`/get-featured/${spotlight.id}`}
                        className="button-primary"
                      >
                        Read their feature
                      </Link>
                    </div>
                  </div>
                </article>
              </Reveal>
            </div>
          </section>
        )}

        <section className="border-y border-line bg-field">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[.9fr_1.1fr] lg:items-center lg:py-28">
            <Reveal>
              <p className="eyebrow">Interview with confidence</p>
              <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
                Practice the moment before it matters.
              </h2>
              <p className="mt-5 text-lg leading-8 text-muted">
                Move from knowing your story to delivering it clearly. Rehearse
                realistic residency questions, review your recording, and arrive
                prepared for the conversation.
              </p>
              <Link href="/login?as=student" className="button-primary mt-8">
                Explore interview practice
              </Link>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="overflow-hidden border border-line bg-white shadow-lift">
                <Image
                  src="/images/residency-interview-success.png"
                  alt="A confident international medical graduate succeeding in a remote residency interview"
                  width={1448}
                  height={1086}
                  className="h-auto w-full"
                />
              </div>
            </Reveal>
          </div>
        </section>

        <section
          id="faq"
          className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:py-28"
        >
          <Reveal className="text-center">
            <p className="eyebrow">Frequently asked questions</p>
            <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink sm:text-5xl">
              Everything you need to know
            </h2>
          </Reveal>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {faqs.map(([question, answer]) => (
              <details key={question} className="group py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-normal tracking-[0.02em] text-ink">
                  {question}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-line text-muted group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-3xl leading-7 text-muted">{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 pb-20 sm:px-6 lg:pb-28">
          <Reveal className="mx-auto max-w-7xl bg-black px-6 py-14 text-center sm:px-12 sm:py-16">
            <h2 className="text-3xl font-normal tracking-[0.02em] !text-white sm:text-4xl">
              Your residency journey can feel clearer.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-[#dedede]">
              Start with the stage you are in today. Magna-Q will help you see
              the next one.
            </p>
            <Link
              href="/login?as=student"
              className="button-primary mt-8 min-h-12 px-6"
            >
              Get started
            </Link>
          </Reveal>
        </section>
      </main>
    </>
  );
}

function FeatureIcon({ index }: { index: number }) {
  const paths = [
    "M4 19V9m5 10V5m5 14v-7m5 7V3",
    "M12 3 4 7v5c0 5 3.4 8 8 9 4.6-1 8-4 8-9V7z",
    "M4 5h16v12H9l-5 4z",
    "M4 19h16M6 16V8m6 8V4m6 12v-5",
    "M5 4h14v16H5zM8 8h8m-8 4h8m-8 4h5",
    "M3 12h4l3-7 4 14 3-7h4",
  ];
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index]} />
    </svg>
  );
}
