import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireOnboardedProfile } from "@/lib/auth/guards";
import { translate } from "@/lib/i18n/messages";

export const metadata: Metadata = { title: "Settings | Magna-Q" };

export default async function SettingsPage() {
  const profile = await requireOnboardedProfile();

  return (
    <AppShell
      title={translate(profile.preferredLocale, "settings.pageTitle")}
      name={profile.fullName}
    >
      <SettingsPanel
        initialLocale={profile.preferredLocale}
        userId={profile.id}
      />
    </AppShell>
  );
}
