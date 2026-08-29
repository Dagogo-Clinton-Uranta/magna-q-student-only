import "server-only";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

export async function reserveSignupSlot(ipAddress: string) {
  const { data, error } = await createServiceRoleClient().rpc(
    "reserve_signup_ip_slot",
    { raw_ip: ipAddress },
  );
  return { allowed: !error && data === true, error };
}

export async function releaseSignupSlot(ipAddress: string) {
  const { data, error } = await createServiceRoleClient().rpc(
    "release_signup_ip_slot",
    { raw_ip: ipAddress },
  );
  return { released: !error && data === true, error };
}
