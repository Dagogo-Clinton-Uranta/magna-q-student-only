export function DeliveryInsights({ metrics }: { metrics: unknown }) {
  const value = metrics && typeof metrics === "object" ? metrics as Record<string, unknown> : null;
  if (!value) return null;
  const items = [
    ["Duration", `${Number(value.durationSeconds ?? 0).toFixed(0)} sec`],
    ["Words", String(value.wordCount ?? 0)],
    ["Speaking rate", `${value.wordsPerMinute ?? 0} wpm`],
    ["Filler words", String(value.fillerWordCount ?? 0)],
    ["Long pauses", String(value.longPauseCount ?? 0)],
    ["Longest pause", `${Number(value.longestPauseSeconds ?? 0).toFixed(1)} sec`],
  ];
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="text-xl font-bold">Delivery Insights</h3>
      <p className="mt-1 text-sm text-slate-600">
        These objective transcript-timing observations are coaching aids and do
        not affect professionalism, judgment, or competency scores.
      </p>
      <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map(([label, display]) => <div key={label}><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-bold text-slate-900">{display}</dd></div>)}
      </dl>
    </section>
  );
}
