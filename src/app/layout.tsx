import type { Metadata } from "next";
import { ConditionalSiteFooter } from "@/components/layout/site-footer";
import { ContentProtection } from "@/components/security/content-protection";
import { ThemeRouteController } from "@/components/settings/theme-route-controller";
import "./globals.css";

export const metadata: Metadata = {
  title: "Magna-Q",
  description:
    "Licensing exam, residency, interview, and Match preparation for international medical graduates.",
  icons: { icon: "/images/brand/magna-q-blue-logo-only.png" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=location.pathname;var excluded=p==='/login'||p==='/onboarding';var dark=localStorage.getItem('magna-q-theme')==='dark'&&!excluded;document.documentElement.classList.toggle('dark',dark)}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ThemeRouteController />
        <ContentProtection>{children}</ContentProtection>
        <ConditionalSiteFooter />
      </body>
    </html>
  );
}
