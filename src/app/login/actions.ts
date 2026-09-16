"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIpFromHeaders } from "@/lib/auth/signup-ip";
import {
  releaseSignupSlot,
  reserveSignupSlot,
} from "@/lib/auth/signup-ip-limit";
import { logEvent } from "@/lib/logging/logger";
import {
  LOCALE_COOKIE_NAME,
  normalizeLocale,
  type AppLocale,
} from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";
import {
  authCredentialsSchema,
  studentRegistrationSchema,
} from "@/lib/validation/auth";

function authError(message: string, mode: "login" | "signup"): never {
  redirect(`/login?mode=${mode}&error=${encodeURIComponent(message)}`);
}

function captchaToken(formData: FormData, mode: "login" | "signup") {
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim()) return undefined;

  const token = formData.get("cf-turnstile-response");
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    authError("Complete the human verification and try again.", mode);
  }
  return token;
}

function isCaptchaError(error: { code?: string } | null) {
  return error?.code === "captcha_failed";
}

function parseCredentials(formData: FormData, mode: "login" | "signup") {
  const parsed = authCredentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    authError(
      "Enter a valid email and a password of at least 8 characters.",
      mode,
    );
  return parsed.data;
}

function signupProxyPlatform() {
  if (process.env.VERCEL) return "vercel" as const;
  if (process.env.CF_PAGES || process.env.CLOUDFLARE_WORKERS)
    return "cloudflare" as const;
  return "generic" as const;
}

export async function signInWithPassword(formData: FormData) {
  const captcha = captchaToken(formData, "login");
  const credentials = parseCredentials(formData, "login");
  const supabase = await createClient();
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
    options: { captchaToken: captcha },
  });
  if (isCaptchaError(error))
    authError("Human verification failed. Please try again.", "login");
  if (error) authError("The email or password is incorrect.", "login");
  const { data: profile } = await supabase
    .from("profiles")
    .select("role,preferred_locale")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profile?.role !== "student") {
    await supabase.auth.signOut();
    authError("This portal is available to student accounts only.", "login");
  }
  await setLocaleCookie(normalizeLocale(profile.preferred_locale));
  redirect("/login");
}

export async function signUpWithPassword(formData: FormData) {
  const captcha = captchaToken(formData, "signup");
  const registration = studentRegistrationSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    username: formData.get("username"),
    countryCode: formData.get("countryCode"),
    phoneCountryCode: formData.get("phoneCountryCode"),
    phoneNumber: formData.get("phoneNumber"),
    medicalSchool: formData.get("medicalSchool") || undefined,
    trainingLevel: formData.get("trainingLevel") || undefined,
    studyStage: formData.get("studyStage"),
    acceptedTerms: formData.get("acceptedTerms"),
  });
  if (!registration.success) {
    authError(
      "Complete all required fields, including username, email, first name, last name, and phone number, then accept the terms.",
      "signup",
    );
  }

  const credentials = registration.data;
  const supabase = await createClient();
  const { data: usernameAvailable, error: usernameError } = await supabase.rpc(
    "username_available",
    { candidate: credentials.username },
  );
  if (usernameError || usernameAvailable !== true)
    authError(
      usernameError
        ? "We could not check that username. Please try again."
        : "That username is already taken. Please choose another.",
      "signup",
    );

  const clientIp = clientIpFromHeaders(await headers(), signupProxyPlatform());
  if (!clientIp)
    authError(
      "We could not verify your network address. Please try again from a standard browser connection.",
      "signup",
    );
  const reservation = await reserveSignupSlot(clientIp);
  if (reservation.error) {
    logEvent("signup_ip_limit_error", { operation: "reserve" });
    authError(
      "We could not verify signup eligibility. Please try again later.",
      "signup",
    );
  }
  if (!reservation.allowed)
    authError(
      "A maximum of two accounts can be created from the same network address.",
      "signup",
    );

  const signupResult = await supabase.auth
    .signUp({
      email: credentials.email,
      password: credentials.password,
      options: { captchaToken: captcha },
    })
    .catch(async () => {
      const release = await releaseSignupSlot(clientIp);
      if (!release.released)
        logEvent("signup_ip_limit_error", { operation: "release" });
      return null;
    });
  const accountWasCreated = Boolean(
    signupResult?.data.user &&
    (signupResult.data.user.identities === undefined ||
      signupResult.data.user.identities.length > 0),
  );
  if (!signupResult || signupResult.error || !accountWasCreated) {
    if (signupResult) {
      const release = await releaseSignupSlot(clientIp);
      if (!release.released)
        logEvent("signup_ip_limit_error", { operation: "release" });
    }
    if (signupResult && isCaptchaError(signupResult.error))
      authError("Human verification failed. Please try again.", "signup");
    authError(
      "We could not create the account. The email may already be registered.",
      "signup",
    );
  }
  const { data } = signupResult;
  if (data.session && data.user) {
    const targetExam =
      credentials.studyStage === "residency_interviews"
        ? "step2ck"
        : credentials.studyStage;
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        username: credentials.username,
        first_name: credentials.firstName,
        last_name: credentials.lastName,
        full_name: `${credentials.firstName} ${credentials.lastName}`,
        email: credentials.email,
        country_code: credentials.countryCode,
        phone_country_code: credentials.phoneCountryCode,
        phone_number: credentials.phoneNumber,
        medical_school: credentials.medicalSchool || null,
        training_level: credentials.trainingLevel || null,
        study_stage: credentials.studyStage,
        // Residency-interview students keep Step 2 CK as the question-bank
        // default while their real journey stage remains separately recorded.
        target_exam: targetExam,
        role: "student",
        onboarding_completed: true,
      },
      { onConflict: "id" },
    );
    if (profileError)
      redirect(
        "/onboarding?error=Your+account+was+created%2C+but+we+could+not+save+your+profile.+Please+complete+it+again.",
      );
    await setLocaleCookie("en");
    redirect("/dashboard");
  }
  authError(
    "The account was created but could not be signed in. Please try again.",
    "login",
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  (await cookies()).delete(LOCALE_COOKIE_NAME);
  redirect("/");
}

async function setLocaleCookie(locale: AppLocale) {
  (await cookies()).set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
