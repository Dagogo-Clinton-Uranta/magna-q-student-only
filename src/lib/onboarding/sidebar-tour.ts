export const SIDEBAR_TOUR_START_EVENT = "magna-q:start-sidebar-tour";
export const SIDEBAR_TOUR_COMPLETE_EVENT = "magna-q:complete-sidebar-tour";

export function sidebarTourStorageKey(userId: string) {
  return `magna-q-sidebar-tour-completed:${userId}`;
}
