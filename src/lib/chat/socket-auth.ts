import { createHash, randomBytes } from "node:crypto";
import IORedis from "ioredis";

export type SocketUser = {
  id: string;
  name: string;
  /** The paid period expiry is copied into the opaque ticket at issue time. */
  accessExpiresAt: string;
};

type CachedSocketAuthentication = {
  version: 1;
  user: SocketUser;
  expiresAt: number;
};

export type SocketAuthStore = Pick<IORedis, "get" | "set">;

const DEFAULT_TTL_SECONDS = 60 * 60;
const MAX_TTL_SECONDS = 24 * 60 * 60;
let redis: IORedis | undefined;

function configuredTtlSeconds() {
  const configured = Number(process.env.CHAT_SOCKET_AUTH_TTL_SECONDS);
  if (!Number.isSafeInteger(configured) || configured < 60)
    return DEFAULT_TTL_SECONDS;
  return Math.min(configured, MAX_TTL_SECONDS);
}

function socketAuthRedis() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl)
    throw new Error("REDIS_URL is required for chat socket authentication.");
  redis ??= new IORedis(redisUrl, {
    maxRetriesPerRequest: 1,
  });
  return redis;
}

function ticketKey(ticket: string) {
  const digest = createHash("sha256").update(ticket).digest("hex");
  return `chat:socket-auth:v1:${digest}`;
}

function isSocketUser(value: unknown): value is SocketUser {
  if (!value || typeof value !== "object") return false;
  const user = value as Partial<SocketUser>;
  return (
    typeof user.id === "string" &&
    user.id.length > 0 &&
    typeof user.name === "string" &&
    user.name.length > 0 &&
    typeof user.accessExpiresAt === "string" &&
    Number.isFinite(Date.parse(user.accessExpiresAt)) &&
    Date.parse(user.accessExpiresAt) > Date.now()
  );
}

export async function issueSocketAuthentication(
  user: SocketUser,
  store: SocketAuthStore = socketAuthRedis(),
  ttlSeconds = configuredTtlSeconds(),
) {
  const paidPeriodExpiry = Date.parse(user.accessExpiresAt);
  if (!Number.isFinite(paidPeriodExpiry) || paidPeriodExpiry <= Date.now())
    throw new Error("A current paid chat entitlement is required.");

  // A chat ticket must never outlive the Stripe-paid billing period, even if
  // the configured Redis ticket TTL is longer.
  const effectiveTtlSeconds = Math.min(
    ttlSeconds,
    Math.max(1, Math.ceil((paidPeriodExpiry - Date.now()) / 1000)),
  );
  const ticket = randomBytes(32).toString("base64url");
  const authentication: CachedSocketAuthentication = {
    version: 1,
    user,
    expiresAt: Math.min(
      Date.now() + effectiveTtlSeconds * 1000,
      paidPeriodExpiry,
    ),
  };
  await store.set(
    ticketKey(ticket),
    JSON.stringify(authentication),
    "EX",
    effectiveTtlSeconds,
  );
  return ticket;
}

export async function readSocketAuthentication(
  ticket: unknown,
  store: SocketAuthStore = socketAuthRedis(),
): Promise<SocketUser | null> {
  if (typeof ticket !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(ticket))
    return null;

  const cached = await store.get(ticketKey(ticket));
  if (!cached) return null;

  try {
    const authentication = JSON.parse(
      cached,
    ) as Partial<CachedSocketAuthentication>;
    if (
      authentication.version !== 1 ||
      !isSocketUser(authentication.user) ||
      typeof authentication.expiresAt !== "number" ||
      authentication.expiresAt <= Date.now()
    )
      return null;
    return authentication.user;
  } catch {
    return null;
  }
}
