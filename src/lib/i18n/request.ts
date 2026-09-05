import "server-only";

import { cookies, headers } from "next/headers";
import {
  isAppLocale,
  LOCALE_COOKIE_NAME,
  localeFromAcceptLanguage,
  type AppLocale,
} from "./config";

export async function getRequestLocale(): Promise<AppLocale> {
  const stored = (await cookies()).get(LOCALE_COOKIE_NAME)?.value;
  if (isAppLocale(stored)) return stored;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}
