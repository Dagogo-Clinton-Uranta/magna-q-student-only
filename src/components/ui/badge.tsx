import type { HTMLAttributes, ReactNode } from "react";

export function Badge({
  variant = "fill",
  dismissIcon,
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  variant?: "fill" | "outline" | "accent";
  dismissIcon?: ReactNode;
}) {
  const variants = {
    fill: "border-transparent bg-field text-body",
    outline: "border-line bg-transparent text-body",
    accent: "border-brand-200 bg-brand-50 text-brand-800",
  };
  return (
    <span
      className={`inline-flex min-h-8 items-center gap-1.5 rounded-full border px-3 py-2 text-sm leading-4 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
      {dismissIcon && <span aria-hidden="true">{dismissIcon}</span>}
    </span>
  );
}
