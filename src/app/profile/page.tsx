import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceHero } from "@/components/layout/workspace-hero";
import { StageRankSelector } from "@/components/profile/stage-rank-selector";
import { FormSubmitButton } from "@/components/ui/form-submit-button";
import { getCurrentUser, requireOnboardedProfile } from "@/lib/auth/guards";
import { COUNTRIES } from "@/lib/countries";
import { createClient } from "@/lib/supabase/server";
import { updateStudentProfile } from "./actions";

type ProfileDetails = {
  username: string;
  email: string | null;
  full_name: string;
  first_name: string | null;
  last_name: string | null;
  country_code: string;
  phone_country_code: string | null;
  phone_number: string | null;
  medical_school: string | null;
  training_level: string | null;
  study_stage: "step1" | "step2ck" | "step3" | "residency_interviews" | null;
  target_exam: "step1" | "step2ck" | "step3";
};

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const [profile, user, params] = await Promise.all([
    requireOnboardedProfile(),
    getCurrentUser(),
    searchParams,
  ]);
  const supabase = await createClient();
  const [detailsResult, trackedResult, trackedEventResult] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "username,email,full_name,first_name,last_name,country_code,phone_country_code,phone_number,medical_school,training_level,study_stage,target_exam",
      )
      .eq("id", profile.id)
      .single(),
    supabase
      .from("tracked_residencies")
      .select("residency_id", { count: "exact", head: true })
      .eq("user_id", profile.id),
    supabase
      .from("tracked_residency_events")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", profile.id),
  ]);

  if (detailsResult.error || !detailsResult.data) {
    throw new Error("Unable to load your profile details.");
  }
  if (trackedResult.error) {
    throw new Error("Unable to load your tracked residencies.");
  }
  if (trackedEventResult.error) {
    throw new Error("Unable to load your tracked opportunities.");
  }

  const details = detailsResult.data as unknown as ProfileDetails;
  const trackedCount = trackedResult.count ?? 0;
  const trackedEventCount = trackedEventResult.count ?? 0;
  const fallbackNames = details.full_name.trim().split(/\s+/);
  const firstName = details.first_name ?? fallbackNames[0] ?? "";
  const lastName =
    details.last_name ??
    (fallbackNames.length > 1 ? fallbackNames.slice(1).join(" ") : "");
  const studyStage = details.study_stage ?? details.target_exam;

  return (
    <AppShell title="Profile" name={profile.fullName}>
      <WorkspaceHero image="guidelines" className="mt-6">
        <p className="eyebrow">Your workspace</p>
        <h2 className="mt-3 text-3xl font-normal tracking-[0.02em] text-ink">
          Personal details and residency shortlist
        </h2>
        <p className="mt-3 max-w-3xl leading-7 text-muted">
          Keep your student details current and return to the programs you are
          actively considering.
        </p>
      </WorkspaceHero>

      {params.updated === "1" && (
        <div
          role="status"
          className="mt-6 border border-emerald-300 bg-emerald-50 p-4 text-sm font-semibold text-emerald-900"
        >
          Your profile changes have been saved.
        </div>
      )}
      {params.error && (
        <div
          role="alert"
          className="mt-6 border border-red-300 bg-red-50 p-4 text-sm font-semibold text-red-900"
        >
          {params.error}
        </div>
      )}

      <StageRankSelector initialStage={studyStage} />

      <section className="mt-8 border border-slate-200 bg-white p-6 sm:p-8">
        <p className="eyebrow">Account information</p>
        <h2 className="mt-2 text-2xl">Student details</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Your email address and username identify your account and cannot be
          changed here. You can update the other signup details below.
        </p>

        <form
          action={updateStudentProfile}
          className="mt-7 grid gap-5 sm:grid-cols-2"
        >
          <ProfileField label="First name">
            <input
              name="firstName"
              required
              minLength={1}
              maxLength={60}
              defaultValue={firstName}
              autoComplete="given-name"
              className="input"
            />
          </ProfileField>
          <ProfileField label="Last name">
            <input
              name="lastName"
              required
              minLength={1}
              maxLength={60}
              defaultValue={lastName}
              autoComplete="family-name"
              className="input"
            />
          </ProfileField>
          <ProfileField label="Username">
            <input
              value={details.username}
              readOnly
              aria-readonly="true"
              className="input cursor-not-allowed bg-slate-100 text-muted"
            />
          </ProfileField>
          <ProfileField label="Email address">
            <input
              type="email"
              value={details.email ?? user?.email ?? ""}
              readOnly
              aria-readonly="true"
              className="input cursor-not-allowed bg-slate-100 text-muted"
            />
          </ProfileField>
          <ProfileField label="Country of residence">
            <select
              name="countryCode"
              required
              defaultValue={details.country_code}
              autoComplete="country"
              className="input"
            >
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </ProfileField>
          <fieldset className="sm:col-span-2">
            <legend className="text-sm uppercase tracking-[0.08em]">
              Phone number
            </legend>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <input
                name="phoneCountryCode"
                type="tel"
                required
                defaultValue={details.phone_country_code ?? ""}
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
                defaultValue={details.phone_number ?? ""}
                minLength={5}
                maxLength={20}
                autoComplete="tel-national"
                aria-label="Phone number without country code"
                className="input"
              />
            </div>
          </fieldset>
          <ProfileField label="Medical school" optional>
            <input
              name="medicalSchool"
              maxLength={200}
              defaultValue={details.medical_school ?? ""}
              autoComplete="organization"
              className="input"
            />
          </ProfileField>
          <ProfileField label="Current training level" optional>
            <input
              name="trainingLevel"
              maxLength={100}
              defaultValue={details.training_level ?? ""}
              className="input"
            />
          </ProfileField>
          <div className="sm:col-span-2 sm:max-w-xs">
            <FormSubmitButton pendingLabel="Saving profile…">
              Save profile
            </FormSubmitButton>
          </div>
        </form>
      </section>

      <section
        className="mt-8 border border-slate-200 bg-white p-6 sm:p-8"
        aria-labelledby="tracked-residencies-title"
      >
        <p className="eyebrow">Your shortlist</p>
        <h2 id="tracked-residencies-title" className="mt-2 text-2xl">
          Tracked residencies
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5 border border-brand-200 bg-soft p-5 sm:p-6">
          <div>
            <p className="text-lg font-bold text-slate-950">
              {trackedCount} {trackedCount === 1 ? "program" : "programs"} saved
            </p>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Open your dedicated shortlist to review programs and maintain
              private notes for each residency.
            </p>
          </div>
          <Link href="/profile/tracked-residencies" className="button-primary">
            Open tracked residencies →
          </Link>
        </div>
      </section>

      <section
        className="mt-8 border border-slate-200 bg-white p-6 sm:p-8"
        aria-labelledby="tracked-opportunities-title"
      >
        <p className="eyebrow">Your event plan</p>
        <h2 id="tracked-opportunities-title" className="mt-2 text-2xl">
          Tracked opportunities
        </h2>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-5 border border-brand-200 bg-soft p-5 sm:p-6">
          <div>
            <p className="text-lg font-bold text-slate-950">
              {trackedEventCount}{" "}
              {trackedEventCount === 1 ? "opportunity" : "opportunities"} saved
            </p>
            <p className="mt-2 max-w-2xl leading-7 text-slate-600">
              Review starred open houses and networking events, then maintain
              private preparation and follow-up notes.
            </p>
          </div>
          <Link
            href="/profile/tracked-opportunities"
            className="button-primary"
          >
            Open tracked opportunities →
          </Link>
        </div>
      </section>
    </AppShell>
  );
}

function ProfileField({
  label,
  optional = false,
  children,
}: {
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="uppercase tracking-[0.08em]">
        {label}
        {optional && (
          <span className="normal-case tracking-normal text-muted">
            {" "}
            (optional)
          </span>
        )}
      </span>
      {children}
    </label>
  );
}
