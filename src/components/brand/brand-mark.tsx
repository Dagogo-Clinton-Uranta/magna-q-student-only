import Link from "next/link";
import Image from "next/image";
import { appConfig } from "@/config/app";

/** Shared wordmark used by the public site and student workspace. */
export function BrandMark({
  href = "/",
  inverse = false,
}: {
  href?: string;
  inverse?: boolean;
}) {
  return (
    <Link href={href} className="group inline-flex items-center gap-3">
      <span className="relative h-10 w-14 shrink-0 overflow-hidden">
        <Image
          src="/images/brand/magna-q-blue-logo-only.png"
          alt=""
          fill
          sizes="56px"
          className="object-contain"
        />
      </span>
      <span className="leading-none">
        <span
          className={`font-display text-lg font-normal tracking-[0.02em] ${inverse ? "text-white" : "text-black"}`}
        >
          {appConfig.shortName}
        </span>
      </span>
    </Link>
  );
}
