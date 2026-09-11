export const PAGE_WINDOW_SIZE = 10;

export function getPageWindow(
  currentPage: number,
  totalPages: number,
  windowSize = PAGE_WINDOW_SIZE,
) {
  const safeTotal = Math.max(1, Math.floor(totalPages));
  const safeCurrent = Math.min(safeTotal, Math.max(1, Math.floor(currentPage)));
  const start = Math.floor((safeCurrent - 1) / windowSize) * windowSize + 1;
  const end = Math.min(start + windowSize - 1, safeTotal);

  return {
    start,
    end,
    pages: Array.from({ length: end - start + 1 }, (_, index) => start + index),
    previousWindowPage: start > 1 ? start - 1 : null,
    nextWindowPage: end < safeTotal ? end + 1 : null,
  };
}
