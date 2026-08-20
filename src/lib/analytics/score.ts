export function calculateScore(values: Array<boolean | null>) {
  const total = values.length;
  const correct = values.filter((value) => value === true).length;
  const answered = values.filter((value) => value !== null).length;
  return {
    total,
    correct,
    incorrect: answered - correct,
    unanswered: total - answered,
    percentage: total ? Math.round((correct / total) * 1000) / 10 : 0,
  };
}
