"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
export function ResumeBlockButton({ blockId }: { blockId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  async function resume() {
    setBusy(true);
    const response = await fetch(`/api/study/blocks/${blockId}/resume`, {
      method: "POST",
    });
    if (response.ok) router.push(`/study/block/${blockId}`);
    else setBusy(false);
  }
  return (
    <button
      onClick={() => void resume()}
      disabled={busy}
      className="button-primary disabled:opacity-50"
    >
      {busy ? (
        <LoadingSpinner size="sm" label="Resuming block" />
      ) : (
        "Resume block"
      )}
    </button>
  );
}
