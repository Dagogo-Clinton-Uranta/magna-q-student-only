export function remainingSeconds(input: {
  timeLimitSeconds: number;
  elapsedSeconds: number;
  segmentStartedAt: string | null;
  nowMs: number;
}) {
  const segment = input.segmentStartedAt
    ? Math.max(
        0,
        Math.floor(
          (input.nowMs - new Date(input.segmentStartedAt).getTime()) / 1000,
        ),
      )
    : 0;
  return Math.max(0, input.timeLimitSeconds - input.elapsedSeconds - segment);
}
export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
    : `${minutes}:${String(secs).padStart(2, "0")}`;
}
