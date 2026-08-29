export function mockReadyForFinalization(
  answers: readonly { status: string }[],
  evaluationsCount: number,
) {
  return (
    answers.length === 8 &&
    evaluationsCount === 8 &&
    answers.every((answer) => answer.status === "EVALUATED")
  );
}

export function individualFailureResultState() {
  return { status: "failed" as const, completedAt: null, score: null };
}
