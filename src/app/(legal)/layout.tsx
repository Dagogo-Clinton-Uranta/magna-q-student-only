import Link from "next/link";
import { appConfig } from "@/config/app";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-16 max-w-4xl items-center px-4 sm:px-6">
          <Link href="/" className="font-bold text-blue-900">
            {appConfig.name}
          </Link>
        </div>
      </header>
      <main className="mx-auto min-h-[70vh] max-w-4xl px-4 py-12 sm:px-6">
        {children}
      </main>
    </>
  );
}
