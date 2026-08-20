import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

export type ChatBillingProjection = {
  role: unknown;
  monthlyPayment: unknown;
  status: unknown;
  currentPeriodStart: unknown;
  currentPeriodEnd: unknown;
};

type ProjectionLoader = (
  userId: string,
) => Promise<ChatBillingProjection | null>;

/**
 * Chat runs inside a trusted Node WebSocket function. This client must never be
 * passed to browser code because its service-role key bypasses Row Level
 * Security.
 */
let billingClient: SupabaseClient | undefined;

function getChatBillingClient() {
  if (billingClient) return billingClient;
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required to validate chat subscriptions.",
    );

  billingClient = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  return billingClient;
}

async function loadChatBillingProjection(userId: string) {
  const serviceClient = getChatBillingClient();
  const [profileResult, subscriptionResult] = await Promise.all([
    serviceClient
      .from("profiles")
      .select("role,monthly_payment")
      .eq("id", userId)
      .maybeSingle(),
    serviceClient
      .from("billing_subscriptions")
      .select("status,current_period_start,current_period_end")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (subscriptionResult.error) throw subscriptionResult.error;
  if (!profileResult.data || !subscriptionResult.data) return null;

  return {
    role: profileResult.data.role,
    monthlyPayment: profileResult.data.monthly_payment,
    status: subscriptionResult.data.status,
    currentPeriodStart: subscriptionResult.data.current_period_start,
    currentPeriodEnd: subscriptionResult.data.current_period_end,
  } satisfies ChatBillingProjection;
}

/** Pure entitlement check shared by the cached server lookup and unit tests. */
export function projectionHasCurrentPaidChatAccess(
  projection: ChatBillingProjection | null,
  now = Date.now(),
) {
  if (
    !projection ||
    projection.role !== "student" ||
    projection.monthlyPayment !== "paid" ||
    projection.status !== "active" ||
    typeof projection.currentPeriodStart !== "string" ||
    typeof projection.currentPeriodEnd !== "string"
  )
    return false;

  const periodStart = Date.parse(projection.currentPeriodStart);
  const periodEnd = Date.parse(projection.currentPeriodEnd);
  return (
    Number.isFinite(periodStart) &&
    periodStart <= now &&
    Number.isFinite(periodEnd) &&
    periodEnd > now
  );
}

/**
 * Creates the authoritative socket entitlement lookup. A small cache avoids a
 * Postgres round trip for every chat message while bounding revocation delay
 * well below the 30-second socket audit interval. Errors are never cached and
 * callers fail closed when Supabase is unavailable.
 */
export function createPaidChatAccessChecker(
  loadProjection: ProjectionLoader = loadChatBillingProjection,
  cacheTtlMs = 10_000,
  now: () => number = Date.now,
) {
  const cache = new Map<
    string,
    { checkedAt: number; hasAccess: boolean } | Promise<boolean>
  >();

  return async (userId: string) => {
    const checkedAt = now();
    const cached = cache.get(userId);
    if (cached instanceof Promise) return cached;
    if (cached && checkedAt - cached.checkedAt < cacheTtlMs)
      return cached.hasAccess;

    const pending = loadProjection(userId)
      .then((projection) => {
        const completedAt = now();
        const hasAccess = projectionHasCurrentPaidChatAccess(
          projection,
          completedAt,
        );
        cache.set(userId, { checkedAt: completedAt, hasAccess });
        return hasAccess;
      })
      .catch((error) => {
        cache.delete(userId);
        throw error;
      });
    cache.set(userId, pending);
    return pending;
  };
}

export const hasCurrentPaidChatAccess = createPaidChatAccessChecker();
