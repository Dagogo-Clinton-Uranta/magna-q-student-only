export function AnnouncementBanner({ message }: { message: string }) {
  return (
    <>
      <aside
        aria-label={message}
        className="fixed inset-x-0 top-0 z-[100] flex h-[30px] items-center overflow-hidden bg-yellow-300 text-black"
      >
        <div className="announcement-banner-track flex min-w-full shrink-0 items-center whitespace-nowrap text-[11px] font-semibold tracking-[0.01em] xl:justify-center xl:px-4 xl:text-xs">
          <span aria-hidden="true">{message}</span>
          <span aria-hidden="true" className="pl-16 xl:hidden">
            {message}
          </span>
        </div>
      </aside>
      <div className="h-[30px]" aria-hidden="true" />
    </>
  );
}
