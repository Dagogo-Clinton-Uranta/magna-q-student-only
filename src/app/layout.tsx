/* eslint-disable @next/next/no-page-custom-font -- The source Figma font is loaded at runtime so production builds do not depend on a font download. */
import type { Metadata } from "next";
import { ConditionalSiteFooter } from "@/components/layout/site-footer";
import { ContentProtection } from "@/components/security/content-protection";
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
    <html lang="en">
      <head>
        {/* Tenor Sans is the source Figma system's typeface. This stylesheet
            keeps the build independent of font downloads at compile time. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tenor+Sans&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ContentProtection>{children}</ContentProtection>
        <ConditionalSiteFooter />
      </body>
    </html>
  );
}
