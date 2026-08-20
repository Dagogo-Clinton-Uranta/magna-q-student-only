/**
 * Only local application paths may be used after Checkout or a paywall visit.
 * Rejecting protocol-relative paths prevents an attacker from turning a
 * `returnTo` query parameter into an open redirect.
 */
export function sanitizeReturnPath(value: unknown, fallback = "/dashboard") {
  if (
    typeof value !== "string" ||
    !value ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return fallback;

  try {
    const parsed = new URL(value, "https://medinexus.invalid");
    if (parsed.origin !== "https://medinexus.invalid") return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return fallback;
  }
}
