import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { appConfig } from "@/config/app";
import { signInWithPassword, signUpWithPassword } from "@/app/login/actions";
import {
  getCurrentProfile,
  getCurrentUser,
  profileHome,
} from "@/lib/auth/guards";
import { DEMO_AUTH_BYPASS_ENABLED } from "@/lib/auth/demo";
import { PasswordInput } from "@/components/auth/password-input";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { UsernameInput } from "@/components/auth/username-input";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { COUNTRIES } from "@/lib/countries";

export const metadata: Metadata = { title: `Sign in | ${appConfig.name}` };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; error?: string }>;
}) {
  const user = DEMO_AUTH_BYPASS_ENABLED ? null : await getCurrentUser();
  if (user) {
    const profile = await getCurrentProfile();
    redirect(
      profile?.onboardingCompleted ? profileHome(profile.role) : "/onboarding",
    );
  }
  const params = await searchParams;
  const isSignup = !DEMO_AUTH_BYPASS_ENABLED && params.mode === "signup";
  const isStudentRegistration = isSignup;
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="hidden border-r border-brand-200 bg-soft p-12 text-ink lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="text-xl font-normal tracking-[0.08em]">
          {appConfig.name}
        </Link>
        <div>
          <p className="eyebrow">
            {DEMO_AUTH_BYPASS_ENABLED ? "Demo access" : "Secure account access"}
          </p>
          <h1 className="mt-5 max-w-xl text-5xl font-normal leading-tight tracking-[0.02em]">
            Continue your path to residency on any device.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-muted">
            {DEMO_AUTH_BYPASS_ENABLED
              ? "Enter the student product immediately."
              : "Your exam progress, residency resources, and interview practice stay connected in one secure workspace."}
          </p>
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-brand-700">
          Magna-Q
        </p>
      </section>
      <section className="flex items-center justify-center px-5 py-12">
        <div
          className={`w-full ${isStudentRegistration ? "max-w-3xl" : "max-w-md"}`}
        >
          <Link
            href="/"
            className="font-normal tracking-[0.08em] text-ink lg:hidden"
          >
            {appConfig.name}
          </Link>
          <p className="eyebrow mt-10 lg:mt-0">Student access</p>
          <h2 className="mt-4 text-3xl font-normal tracking-[0.02em] text-ink">
            {DEMO_AUTH_BYPASS_ENABLED
              ? "Continue as a student"
              : isSignup
                ? "Create your account"
                : "Sign in to your account"}
          </h2>
          <p className="mt-3 text-muted">
            {DEMO_AUTH_BYPASS_ENABLED
              ? "Authentication is temporarily disabled for this demonstration."
              : isStudentRegistration
                ? "Tell us a little about your journey so we can shape the experience around your stage."
                : `Enter your email address and password to ${isSignup ? "register" : "continue"}.`}
          </p>
          {params.error && (
            <div
              role="alert"
              className="mt-6 border border-red-300 bg-red-50 p-3 text-sm text-red-900"
            >
              {params.error}
            </div>
          )}
          {DEMO_AUTH_BYPASS_ENABLED ? (
            <Link href="/demo-session" className="button-primary mt-8 w-full">
              Continue to demo
            </Link>
          ) : (
            <form
              action={isSignup ? signUpWithPassword : signInWithPassword}
              className={`mt-8 grid gap-5 ${isStudentRegistration ? "sm:grid-cols-2" : ""}`}
            >
              {isStudentRegistration && (
                <>
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
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
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
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
                  <UsernameInput />
                </>
              )}
              <label className="block text-sm">
                <span className="uppercase tracking-[0.08em]">
                  Email address
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="input"
                />
              </label>
              <PasswordInput
                autoComplete={isSignup ? "new-password" : "current-password"}
              />
              {isStudentRegistration && (
                <>
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
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
                      <option value="residency_interviews">
                        Residency interviews
                      </option>
                    </select>
                  </label>
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
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
                  <fieldset className="sm:col-span-2">
                    <legend className="text-sm uppercase tracking-[0.08em]">
                      Phone number
                    </legend>
                    <div className="grid grid-cols-[7rem_1fr] gap-3">
                      <label>
                        <span className="sr-only">Country calling code</span>
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
                      </label>
                      <label>
                        <span className="sr-only">
                          Phone number without country code
                        </span>
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
                      </label>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      Enter the calling code with +, then your phone number
                      without it.
                    </p>
                  </fieldset>
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
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
                  <label className="block text-sm">
                    <span className="uppercase tracking-[0.08em]">
                      Training level{" "}
                      <span className="normal-case tracking-normal text-muted">
                        (optional)
                      </span>
                    </span>
                    <input
                      name="trainingLevel"
                      maxLength={100}
                      placeholder="Medical student, graduate, intern…"
                      className="input"
                    />
                  </label>
                  <label className="flex gap-3 border border-line bg-field p-4 text-sm sm:col-span-2">
                    <input
                      name="acceptedTerms"
                      type="checkbox"
                      required
                      className="mt-1 h-5 w-5 shrink-0 accent-black"
                    />
                    <span>
                      I accept the{" "}
                      <Link href="/terms" target="_blank" className="underline">
                        Terms
                      </Link>{" "}
                      and acknowledge the{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="underline"
                      >
                        Privacy Notice
                      </Link>
                      .
                    </span>
                  </label>
                </>
              )}
              {turnstileSiteKey && (
                <TurnstileWidget
                  key={isSignup ? "signup" : "login"}
                  siteKey={turnstileSiteKey}
                  action={isSignup ? "signup" : "login"}
                />
              )}
              <FormSubmitButton
                pendingLabel={isSignup ? "Creating account…" : "Signing in…"}
                className={`button-primary min-h-12 w-full ${isStudentRegistration ? "sm:col-span-2" : ""}`}
              >
                {isSignup ? "Create account" : "Sign in"}
              </FormSubmitButton>
            </form>
          )}
          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {!DEMO_AUTH_BYPASS_ENABLED && (
              <Link
                href={isSignup ? "/login" : "/login?mode=signup"}
                className="font-semibold text-brand-700"
              >
                {isSignup ? "Already registered? Sign in" : "Create an account"}
              </Link>
            )}
            <Link href="/" className="text-muted">
              Return home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
