import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env";

/**
 * Creates a server-only Supabase client that bypasses Row Level Security.
 *
 * Reserve this client for trusted provider callbacks and narrowly scoped
 * server operations. Never import it into a Client Component and never expose
 * SUPABASE_SERVICE_ROLE_KEY to the browser. User-facing requests should use the
 * cookie-bound client from `@/lib/supabase/server` so PostgreSQL RLS applies.
 */
export function createServiceRoleClient() {
  const env = getServerEnv();
  if (!env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is required for trusted server operations.",
    );

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
