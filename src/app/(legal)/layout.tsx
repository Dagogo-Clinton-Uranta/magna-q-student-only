import Link from "next/link";
import { appConfig } from "@/config/app";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-6">
          <Link href="/" className="font-bold text-ink">
            {appConfig.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        {children}
      </main>
    </>
  );
}
