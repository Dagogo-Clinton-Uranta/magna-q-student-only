function boundedNonEmpty(
  providerValue: string | null | undefined,
  trustedFallback: string,
  maxLength: number,
  finalFallback: string,
) {
  for (const value of [providerValue, trustedFallback, finalFallback]) {
    const normalized = value?.trim().replace(/[\u0000-\u001f\u007f]/g, " ");
    if (normalized) return normalized.slice(0, maxLength);
  }
  return finalFallback;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validBoundedEmail(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized &&
    normalized.length <= 320 &&
    EMAIL_PATTERN.test(normalized)
    ? normalized
    : null;
}

/** Normalizes Stripe-controlled identity snapshots to the database limits. */
export function normalizePaymentIdentitySnapshot({
  providerName,
  providerEmail,
  trustedName,
  trustedEmail,
}: {
  providerName: string | null | undefined;
  providerEmail: string | null | undefined;
  trustedName: string;
  trustedEmail: string;
}) {
  return {
    name: boundedNonEmpty(providerName, trustedName, 200, "Student"),
    email:
      validBoundedEmail(providerEmail) ??
      validBoundedEmail(trustedEmail) ??
      "unknown@invalid.local",
  };
}
