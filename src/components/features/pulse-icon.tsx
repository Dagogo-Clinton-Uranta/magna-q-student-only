export function PulseIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="13.25" strokeWidth="1.5" opacity="0.42" />
      <path
        d="M4.25 16h5.2l2.45-4.8 3.45 10.25 3.45-12.3 2.65 6.85h6.3"
        strokeWidth="4.5"
        opacity="0.14"
      />
      <path
        d="M4.25 16h5.2l2.45-4.8 3.45 10.25 3.45-12.3 2.65 6.85h6.3"
        strokeWidth="2"
      />
      <circle cx="27.75" cy="16" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}
