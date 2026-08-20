export function parseStripeLiveMode(value: string | undefined) {
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(
    "STRIPE_LIVE_MODE must be explicitly set to true for live Stripe data or false for test data.",
  );
}

export function stripeModeMatches(
  providerLivemode: boolean,
  configuredLivemode: boolean,
) {
  return providerLivemode === configuredLivemode;
}
