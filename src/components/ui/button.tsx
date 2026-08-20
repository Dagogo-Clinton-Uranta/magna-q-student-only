import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

/**
 * Open Fashion button variants translated for Magna-Q.
 * Heights map to the Figma S/M/L variants: 40px, 48px, and 56px.
 */
export function buttonStyles({
  variant = "primary",
  size = "md",
  fullWidth = false,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
} = {}) {
  const base =
    "inline-flex items-center justify-center gap-3 rounded-none border text-center font-normal uppercase tracking-[0.1em] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary:
      "border-black bg-black text-[#fcfcfc] hover:border-brand-700 hover:bg-brand-700 active:bg-brand-800",
    secondary:
      "border-black bg-black text-[#fcfcfc] hover:border-brand-700 hover:bg-brand-700 active:bg-brand-800",
    ghost:
      "border-transparent bg-transparent text-body hover:bg-field hover:text-black",
    danger:
      "border-black bg-black text-white hover:border-brand-700 hover:bg-brand-700",
  };
  const sizes: Record<ButtonSize, string> = {
    sm: "min-h-10 px-[30px] py-2 text-xs",
    md: "min-h-12 px-8 py-3 text-sm",
    lg: "min-h-14 px-9 py-3.5 text-sm",
  };
  return [base, variants[variant], sizes[size], fullWidth ? "w-full" : ""]
    .filter(Boolean)
    .join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  leadingIcon,
  trailingIcon,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}) {
  return (
    <button
      className={`${buttonStyles({ variant, size, fullWidth })} ${className}`}
      {...props}
    >
      {leadingIcon && <span aria-hidden="true">{leadingIcon}</span>}
      {children}
      {trailingIcon && <span aria-hidden="true">{trailingIcon}</span>}
    </button>
  );
}
