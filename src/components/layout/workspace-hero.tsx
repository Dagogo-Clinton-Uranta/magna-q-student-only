import React from "react";
import Image from "next/image";

const heroImages = {
  journey: "/images/medinexus-journey-hero.png",
  guidelines: "/images/usmle-guidelines-hero.png",
} as const;

export type WorkspaceHeroImage = keyof typeof heroImages;

export function WorkspaceHero({
  image,
  className = "",
  children,
}: {
  image: WorkspaceHeroImage;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden border border-brand-200 bg-soft p-6 sm:p-8 ${className}`}
    >
      <Image
        src={heroImages[image]}
        alt=""
        fill
        sizes="(min-width: 1024px) 80vw, 100vw"
        className="pointer-events-none select-none object-cover object-right opacity-10"
        aria-hidden="true"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}
