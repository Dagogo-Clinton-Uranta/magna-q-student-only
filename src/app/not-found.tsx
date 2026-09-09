import type { Metadata } from "next";
import { ErrorScreen } from "@/components/errors/error-screen";

export const metadata: Metadata = {
  title: "Page not found | Magna-Q",
};

export default function NotFound() {
  return (
    <ErrorScreen
      eyebrow="404 · Page not found"
      title="We can’t find this page."
      description="The link may be outdated, or the page may have moved. Return home and we’ll help you find the right path."
    />
  );
}
