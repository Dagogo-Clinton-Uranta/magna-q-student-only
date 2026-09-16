const ANNOUNCEMENT =
  "New users get free access to our reading resources and 3 free video interviews, to activate it, please drop a message in one of our chat rooms, take advantage while the offer is on";

export function AnnouncementBanner() {
  return (
    <>
      <aside
        aria-label={ANNOUNCEMENT}
        className="fixed inset-x-0 top-0 z-[100] flex h-[30px] items-center overflow-hidden bg-yellow-300 text-black"
      >
        <div className="announcement-banner-track flex min-w-full shrink-0 items-center whitespace-nowrap text-[11px] font-semibold tracking-[0.01em] xl:justify-center xl:px-4 xl:text-xs">
          <span aria-hidden="true">{ANNOUNCEMENT}</span>
          <span aria-hidden="true" className="pl-16 xl:hidden">
            {ANNOUNCEMENT}
          </span>
        </div>
      </aside>
      <div className="h-[30px]" aria-hidden="true" />
    </>
  );
}
