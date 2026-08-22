export function configuredRedisUrl() {
  const value = process.env.REDIS_URL?.trim();
  if (!value) return null;
  if (value.startsWith("REDIS_URL="))
    throw new Error(
      "REDIS_URL is malformed: set it to rediss://... without a second REDIS_URL= prefix.",
    );

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("REDIS_URL must be a valid redis:// or rediss:// URL.");
  }
  if (!["redis:", "rediss:"].includes(parsed.protocol) || !parsed.hostname)
    throw new Error("REDIS_URL must be a valid redis:// or rediss:// URL.");
  return value;
}

export function requireRedisUrl(purpose: string) {
  const value = configuredRedisUrl();
  if (!value) throw new Error(`REDIS_URL is required for ${purpose}.`);
  return value;
}
