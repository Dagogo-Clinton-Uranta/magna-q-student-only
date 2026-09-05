"use client";

import { signOut } from "@/app/login/actions";
import { useI18n } from "@/components/i18n/i18n-provider";

export function SignOutButton() {
  const { t } = useI18n();
  return (
    <form action={signOut}>
      <button className="button-primary min-h-11 px-4 py-2 text-xs">
        {t("auth.signOut")}
      </button>
    </form>
  );
}
