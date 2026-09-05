"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import {
  isAppLocale,
  LOCALE_COOKIE_NAME,
  type AppLocale,
} from "@/lib/i18n/config";
import { createClient } from "@/lib/supabase/server";

export async function updatePreferredLocale(value: string) {
  if (!isAppLocale(value)) {
    return { ok: false as const, error: "Unsupported language." };
  }

  const profile = await requireOnboardedProfile();
  if (profile.id !== "demo-student") {
    const supabase = await createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ preferred_locale: value })
      .eq("id", profile.id);
    if (error) {
      return { ok: false as const, error: "Could not save language." };
    }
  }

  await writeLocaleCookie(value);
  revalidatePath("/", "layout");
  return { ok: true as const, locale: value };
}

async function writeLocaleCookie(locale: AppLocale) {
  (await cookies()).set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
