import type { Metadata } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { SettingsPanel } from "@/components/settings/settings-panel";
import { requireOnboardedProfile } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Settings | Magna-Q" };

export default async function SettingsPage() {
  const profile = await requireOnboardedProfile();

  return (
    <AppShell title="Settings" name={profile.fullName}>
      <SettingsPanel />
    </AppShell>
  );
}
