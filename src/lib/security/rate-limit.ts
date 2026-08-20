import { createClient } from "@/lib/supabase/server";
import { logEvent } from "@/lib/logging/logger";
export async function checkRateLimit(
  scope: string,
  userId: string,
  request: Request,
  maximum: number,
  windowSeconds: number,
) {
  const forwarded =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    raw_key: `${scope}:${userId}:${forwarded}`,
    maximum,
    window_seconds: windowSeconds,
  });
  const allowed = !error && data === true;
  if (!allowed) {
    logEvent("rate_limit_denied", {
      scope,
      userId,
      forwardedFor: forwarded,
      rpcError: error?.message ?? null,
    });
  }
  return allowed;
}
