"use client";

import { useEffect } from "react";
import { ErrorScreen } from "@/components/errors/error-screen";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorScreen
      eyebrow="Something went wrong"
      title="This page didn’t load."
      description="Something interrupted your request. Return home and continue from there while we get things back on track."
    />
  );
}
