import "server-only";
import { createClient } from "@/lib/supabase/server";

type SiteAnnouncementRow = {
  message: string;
};

export async function getSiteAnnouncement(): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_announcements")
    .select("message")
    .eq("id", "primary")
    .eq("enabled", true)
    .maybeSingle();

  if (error) {
    console.error("Unable to load the site announcement", {
      code: error.code,
      message: error.message,
    });
    return null;
  }

  return (data as SiteAnnouncementRow | null)?.message ?? null;
}
