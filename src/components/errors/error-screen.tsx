"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ErrorScreenProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function ErrorScreen({ eyebrow, title, description }: ErrorScreenProps) {
  const [returnHref, setReturnHref] = useState("/login");

  useEffect(() => {
    let active = true;
    const resolveReturnHref = async () => {
      try {
        const {
          data: { user },
        } = await createClient().auth.getUser();
        if (active) setReturnHref(user ? "/dashboard" : "/login");
      } catch {
        if (active) setReturnHref("/login");
      }
    };
    void resolveReturnHref();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-col items-center justify-center bg-canvas">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 py-12 text-center sm:py-16">
        <div className="w-full max-w-lg">
          {/* A plain img keeps the root-level fallback independent of Next's image runtime. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/error-page-illustration-light.png"
            alt="A puzzled doctor in pink scrubs shrugging in a hospital"
            className="h-auto w-full dark:hidden"
          />
          {/* The light image's alpha channel masks the dark export's outer canvas. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/error-page-illustration-dark.png"
            alt="A puzzled doctor in pink scrubs shrugging in a softly lit hospital"
            className="hidden h-auto w-full dark:block"
            style={{
              WebkitMaskImage:
                "url('/images/error-page-illustration-light.png')",
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskImage: "url('/images/error-page-illustration-light.png')",
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
            }}
          />
        </div>

        <div className="relative z-10 -mt-2 max-w-xl sm:-mt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl leading-tight text-ink sm:text-5xl">
            {title}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex justify-center">
            <a href={returnHref} className="button-primary min-w-44">
              Return home
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
