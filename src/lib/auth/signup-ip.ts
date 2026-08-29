import { isIP } from "node:net";

export type SignupProxyPlatform = "vercel" | "cloudflare" | "generic";

const platformHeaders: Record<SignupProxyPlatform, readonly string[]> = {
  vercel: ["x-vercel-forwarded-for"],
  cloudflare: ["cf-connecting-ip"],
  generic: ["fly-client-ip", "x-real-ip", "x-forwarded-for"],
};

export function normalizeClientIp(rawValue: string | null | undefined) {
  const value = rawValue?.trim();
  if (!value) return null;
  const withoutIpv4Mapping = value.toLowerCase().startsWith("::ffff:")
    ? value.slice(7)
    : value;
  const version = isIP(withoutIpv4Mapping);
  if (version === 4) return withoutIpv4Mapping;
  if (version !== 6) return null;
  try {
    const hostname = new URL(`http://[${withoutIpv4Mapping}]/`).hostname;
    return hostname.slice(1, -1).toLowerCase();
  } catch {
    return null;
  }
}

export function clientIpFromHeaders(
  headers: Headers,
  platform: SignupProxyPlatform = "generic",
) {
  for (const header of platformHeaders[platform]) {
    const value = headers.get(header);
    if (!value) continue;
    for (const candidate of value.split(",")) {
      const normalized = normalizeClientIp(candidate);
      if (normalized) return normalized;
    }
  }
  return null;
}
