export function LoadingSpinner({
  label = "Loading",
  size = "md",
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-[3px]",
  };
  return (
    <span role="status" className="inline-flex items-center gap-2">
      <span
        className={`${sizes[size]} animate-spin rounded-full border-brand-200 border-t-brand-600`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
