import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { appConfig } from "@/config/app";
import { getCurrentProfile, profileHome, requireUser } from "@/lib/auth/guards";
import { COUNTRIES } from "@/lib/countries";
import { completeOnboarding } from "./actions";
import { UsernameInput } from "@/components/auth/username-input";

export const metadata: Metadata = {
  title: `Set up your profile | ${appConfig.name}`,
};

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  const profile = await getCurrentProfile();
  if (profile?.onboardingCompleted) redirect(profileHome(profile.role));
  const { error } = await searchParams;
  return (
    <main className="min-h-screen bg-canvas px-4 py-8 sm:py-14">
      <section className="mx-auto max-w-3xl border border-line bg-white p-6 shadow-card sm:p-10">
        <p className="eyebrow">One-minute setup</p>
        <h1 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Tell us where you are in your USMLE journey
        </h1>
        <p className="mt-3 max-w-2xl text-muted">
          These details help us tune learning and residency features to your
          stage. Medical school and training level can be left blank.
        </p>
        {error && (
          <div
            role="alert"
            className="mt-6 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
          >
            {error}
          </div>
        )}
        <form
          action={completeOnboarding}
          className="mt-8 grid gap-5 sm:grid-cols-2"
        >
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              First name
            </span>
            <input
              name="firstName"
              required
              minLength={1}
              maxLength={60}
              autoComplete="given-name"
              className="input"
            />
          </label>
          <UsernameInput />
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Last name
            </span>
            <input
              name="lastName"
              required
              minLength={1}
              maxLength={60}
              autoComplete="family-name"
              className="input"
            />
          </label>
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Email address
            </span>
            <input
              value={user.email ?? ""}
              readOnly
              className="input text-muted"
            />
          </label>
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Your current stage
            </span>
            <select
              name="studyStage"
              required
              defaultValue="step2ck"
              className="input"
            >
              <option value="step1">USMLE Step 1</option>
              <option value="step2ck">USMLE Step 2 CK</option>
              <option value="step3">USMLE Step 3</option>
              <option value="residency_interviews">Residency interviews</option>
            </select>
          </label>
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Country of residence
            </span>
            <select
              name="countryCode"
              required
              defaultValue="NG"
              autoComplete="country"
              className="input"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend className="text-sm uppercase tracking-[0.08em]">
              Phone number
            </legend>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <input
                name="phoneCountryCode"
                type="tel"
                required
                defaultValue="+234"
                pattern="\+[1-9][0-9]{0,3}"
                maxLength={5}
                autoComplete="tel-country-code"
                aria-label="Country calling code"
                className="input"
              />
              <input
                name="phoneNumber"
                type="tel"
                required
                minLength={5}
                maxLength={20}
                autoComplete="tel-national"
                placeholder="Phone number"
                aria-label="Phone number without country code"
                className="input"
              />
            </div>
          </fieldset>
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Medical school{" "}
              <span className="normal-case tracking-normal text-muted">
                (optional)
              </span>
            </span>
            <input
              name="medicalSchool"
              maxLength={200}
              autoComplete="organization"
              className="input"
            />
          </label>
          <label>
            <span className="text-sm uppercase tracking-[0.08em]">
              Current training level{" "}
              <span className="normal-case tracking-normal text-muted">
                (optional)
              </span>
            </span>
            <input
              name="trainingLevel"
              maxLength={100}
              className="input"
              placeholder="Medical student, graduate, intern…"
            />
          </label>
          <label className="flex gap-3 border border-line bg-field p-4 sm:col-span-2">
            <input
              name="acceptedTerms"
              type="checkbox"
              required
              className="mt-1 h-5 w-5 shrink-0 accent-black"
            />
            <span className="text-sm text-body">
              I accept the{" "}
              <a href="/terms" target="_blank" className="underline">
                Terms
              </a>{" "}
              and acknowledge the{" "}
              <a href="/privacy" target="_blank" className="underline">
                Privacy Notice
              </a>
              .
            </span>
          </label>
          <button className="button-primary sm:col-span-2">
            Complete setup
          </button>
        </form>
      </section>
    </main>
  );
}
