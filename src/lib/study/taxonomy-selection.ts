export type SubjectSystemMapping = {
  subject_id: string;
  category_id: string;
};

/** Returns the union of systems mapped beneath the selected subjects. */
export function enabledSystemIdsForSubjects(
  subjectIds: readonly string[],
  mappings: readonly SubjectSystemMapping[],
) {
  const selected = new Set(subjectIds);
  return new Set(
    mappings
      .filter((mapping) => selected.has(mapping.subject_id))
      .map((mapping) => mapping.category_id),
  );
}
