"use client";

import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export function FormSubmitButton({
  children,
  pendingLabel = "Please wait…",
  className = "button-primary w-full",
}: {
  children: React.ReactNode;
  pendingLabel?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <LoadingSpinner size="sm" label={pendingLabel} />
          {pendingLabel}
        </span>
      ) : (
        children
      )}
    </button>
  );
}
