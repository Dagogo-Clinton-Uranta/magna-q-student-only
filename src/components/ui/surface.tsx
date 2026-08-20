import type { HTMLAttributes } from "react";

export function Surface({
  tone = "default",
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: "default" | "soft" | "field";
}) {
  const tones = {
    default: "bg-white",
    soft: "bg-soft",
    field: "bg-field",
  };
  return (
    <div
      className={`rounded-sm border border-line shadow-card ${tones[tone]} ${className}`}
      {...props}
    />
  );
}
