export type RetentionRecord = {
  id: string;
  userId: string;
  type: "mock" | "individual";
  status: "in_progress" | "awaiting_evaluation" | "completed";
  completedAt: string | null;
};

export function planResultRetention(
  records: readonly RetentionRecord[],
  completedRecord: Pick<RetentionRecord, "userId" | "type">,
  limit = 5,
) {
  const eligible = records
    .filter(
      (record) =>
        record.userId === completedRecord.userId &&
        record.type === completedRecord.type &&
        record.status === "completed" &&
        record.completedAt,
    )
    .sort(
      (a, b) =>
        Date.parse(b.completedAt!) - Date.parse(a.completedAt!) ||
        b.id.localeCompare(a.id),
    );
  return {
    retainedIds: eligible.slice(0, limit).map((record) => record.id),
    deletedIds: eligible.slice(limit).map((record) => record.id),
  };
}
