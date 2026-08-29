"use client";

import { useState } from "react";

export function ProcessingRetry({ answerId }: { answerId: string }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function retry() {
    setBusy(true);
    setMessage("");
    const response = await fetch(`/api/interview/answers/${answerId}/retry`, { method: "POST" });
    const body = await response.json() as { error?: string };
    setBusy(false);
    if (!response.ok) return setMessage(body.error ?? "Retry could not be queued.");
    setMessage("Retry queued. You may leave and return later.");
  }
  return <div className="mt-3"><button type="button" disabled={busy} onClick={() => void retry()} className="button-secondary">{busy ? "Queuing…" : "Retry analysis"}</button>{message && <p role="status" className="mt-2 text-sm">{message}</p>}</div>;
}
