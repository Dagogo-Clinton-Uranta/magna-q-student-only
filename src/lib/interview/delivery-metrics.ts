export type TranscriptWord = {
  word: string;
  start: number;
  end: number;
  confidence?: number;
};

const fillers = new Set(["um", "uh", "erm", "hmm", "like"]);

export function calculateDeliveryMetrics(
  words: readonly TranscriptWord[],
  providerDuration?: number,
) {
  const durationSeconds = Math.max(
    0,
    providerDuration ?? words.at(-1)?.end ?? 0,
  );
  const pauses = words.slice(1).map((word, index) => {
    const previous = words[index];
    return previous ? Math.max(0, word.start - previous.end) : 0;
  });
  return {
    durationSeconds: round(durationSeconds),
    wordCount: words.length,
    wordsPerMinute: durationSeconds
      ? Math.round((words.length / durationSeconds) * 60)
      : 0,
    fillerWordCount: words.filter((item) =>
      fillers.has(item.word.toLowerCase().replace(/[^a-z]/g, "")),
    ).length,
    longPauseCount: pauses.filter((pause) => pause >= 2).length,
    longestPauseSeconds: round(Math.max(0, ...pauses)),
  };
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}
