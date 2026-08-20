import type { Metadata } from "next";
import Link from "next/link";
import { appConfig } from "@/config/app";

export const metadata: Metadata = {
  title: `Check your email | ${appConfig.name}`,
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center px-5">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl"
        >
          ✉
        </div>
        <h1 className="mt-6 text-3xl font-bold tracking-tight">
          Check your email
        </h1>
        <p className="mt-4 text-slate-700">
          We sent an account confirmation link
          {email ? (
            <>
              {" "}
              to <strong className="break-all">{email}</strong>
            </>
          ) : null}
          . Confirm the address, then sign in with your email and password.
        </p>
        <ul className="mt-5 list-disc space-y-2 pl-5 text-sm text-slate-600">
          <li>The confirmation link expires for your security.</li>
          <li>Check spam or promotions if it does not arrive.</li>
          <li>
            After confirmation, this link is not needed for future logins.
          </li>
        </ul>
        <Link
          href="/login"
          className="mt-8 inline-flex min-h-11 items-center font-semibold text-blue-800"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
