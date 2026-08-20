import type { InputHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  hint,
  error,
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
}) {
  const descriptionId = props.id ? `${props.id}-description` : undefined;
  return (
    <label className="block text-sm text-body">
      <span className="block uppercase tracking-[0.08em]">{label}</span>
      <input
        className={`input ${error ? "border-red-500" : ""} ${className}`}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        {...props}
      />
      {(error || hint) && (
        <span
          id={descriptionId}
          className={`mt-2 block text-xs leading-[18px] ${error ? "text-red-700" : "text-muted"}`}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}
