"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/errors/error-screen";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{document.documentElement.classList.toggle('dark',localStorage.getItem('magna-q-theme')==='dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <ErrorScreen
          eyebrow="Magna-Q is temporarily unavailable"
          title="We couldn’t open this page."
          description="A temporary problem stopped this page from loading. Return home and continue from there, or come back in a few minutes."
        />
      </body>
    </html>
  );
}
