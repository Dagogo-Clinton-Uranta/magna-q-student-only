export type TextHighlight = { start: number; end: number };

const STORAGE_PREFIX = "magna-q-question-highlights:";

export function highlightStorageKey(questionId: string) {
  return `${STORAGE_PREFIX}${questionId}`;
}

export function normalizeHighlights(
  highlights: TextHighlight[],
  textLength: number,
) {
  const valid = highlights
    .filter(
      ({ start, end }) =>
        Number.isInteger(start) &&
        Number.isInteger(end) &&
        start >= 0 &&
        end > start &&
        start < textLength,
    )
    .map(({ start, end }) => ({ start, end: Math.min(end, textLength) }))
    .sort((left, right) => left.start - right.start || left.end - right.end);

  return valid.reduce<TextHighlight[]>((merged, current) => {
    const previous = merged.at(-1);
    if (!previous || current.start > previous.end) {
      merged.push(current);
    } else {
      previous.end = Math.max(previous.end, current.end);
    }
    return merged;
  }, []);
}

export function readQuestionHighlights(questionId: string, textLength: number) {
  try {
    const stored = window.localStorage.getItem(highlightStorageKey(questionId));
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed)
      ? normalizeHighlights(parsed as TextHighlight[], textLength)
      : [];
  } catch {
    return [];
  }
}

export function writeQuestionHighlights(
  questionId: string,
  highlights: TextHighlight[],
) {
  if (highlights.length === 0) {
    window.localStorage.removeItem(highlightStorageKey(questionId));
    return;
  }
  window.localStorage.setItem(
    highlightStorageKey(questionId),
    JSON.stringify(highlights),
  );
}

export function selectedTextHighlight(
  container: HTMLElement,
  selection: Selection | null,
) {
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed)
    return null;
  const range = selection.getRangeAt(0);
  if (!container.contains(range.commonAncestorContainer)) return null;

  const before = range.cloneRange();
  before.selectNodeContents(container);
  before.setEnd(range.startContainer, range.startOffset);
  let start = before.toString().length;
  let selectedText = range.toString();
  const leadingSpace = selectedText.length - selectedText.trimStart().length;
  start += leadingSpace;
  selectedText = selectedText.trim();
  const end = start + selectedText.length;

  return end > start ? { start, end } : null;
}
