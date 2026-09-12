import { SignOutButton } from "@/components/auth/sign-out-button";
import { BrandMark } from "@/components/brand/brand-mark";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { InterviewCompletionToasts } from "@/components/interview/interview-completion-toasts";
import { getCurrentProfile } from "@/lib/auth/guards";
import { translate, translateWorkspaceTitle } from "@/lib/i18n/messages";

export async function AppShell({
  title,
  name,
  children,
}: {
  title: string;
  name: string;
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();
  const locale = profile?.preferredLocale ?? "en";
  return (
    <div className="min-h-screen pb-24 lg:pb-0 lg:pl-72">
      <InterviewCompletionToasts />
      <SidebarNav
        stage={profile?.studyStage ?? null}
        userId={profile?.id ?? "anonymous"}
        initialTourCompleted={profile?.sidebarTourCompleted ?? true}
      />
      <header className="sticky top-0 z-20 border-b border-line/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <div className="lg:hidden">
            <BrandMark href="/dashboard" />
          </div>
          <span className="hidden text-sm font-medium text-slate-500 lg:block">
            {translate(locale, "shell.learningWorkspace")}
          </span>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-medium text-muted sm:inline">
              {name}
            </span>
            <NotificationBell />
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <p className="eyebrow">
          {translate(locale, "shell.learningWorkspace")}
        </p>
        <h1 className="mt-3 text-3xl font-normal tracking-[0.02em] sm:text-4xl">
          {translateWorkspaceTitle(locale, title)}
        </h1>
        {children}
      </main>
    </div>
  );
}
