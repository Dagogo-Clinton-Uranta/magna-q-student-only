import type { Metadata } from "next";
import { I18nProvider } from "@/components/i18n/i18n-provider";
import { ConditionalSiteFooter } from "@/components/layout/site-footer";
import { ContentProtection } from "@/components/security/content-protection";
import { ThemeRouteController } from "@/components/settings/theme-route-controller";
import { getCurrentProfile } from "@/lib/auth/guards";
import { getRequestLocale } from "@/lib/i18n/request";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magna-Q",
  description:
    "Licensing exam, residency, interview, and Match preparation for international medical graduates.",
  icons: { icon: "/images/brand/magna-q-blue-logo-only.png" },
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // The profile is authoritative across devices; browser preferences provide
  // a useful default for visitors and users who have not chosen a language.
  const profile = await getCurrentProfile();
  const locale = profile?.preferredLocale ?? (await getRequestLocale());
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;var excluded=p==='/login'||p==='/onboarding';var dark=localStorage.getItem('magna-q-theme')==='dark'&&!excluded;document.documentElement.classList.toggle('dark',dark)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <I18nProvider initialLocale={locale}>
          <ThemeRouteController />
          <ContentProtection>{children}</ContentProtection>
          <ConditionalSiteFooter />
        </I18nProvider>
      </body>
    </html>
  );
}
