export type CommunityFeature = {
  id: string;
  user_id: string | null;
  username: string;
  user_name: string;
  title: string;
  summary: string;
  representative_quote: string;
  image_url: string;
  image_alt_text: string;
  image_credit_text: string | null;
  image_credit_url: string | null;
  front_page_feature: boolean;
  in_app_feature: boolean;
  featured_at: string | null;
  is_sample: boolean;
  created_at: string;
  pulse_count: number | string;
  comment_count: number | string;
};

export type FeatureComment = {
  id: string;
  feature_id: string;
  user_id: string;
  username: string;
  user_name: string;
  content: string;
  mentioned_usernames: string[];
  created_at: string;
};

export function countValue(value: number | string) {
  const count = Number(value);
  return Number.isFinite(count) ? count : 0;
}

const loweredPortraitIds = new Set([
  "88e1b927-7772-42fc-bad6-73cb5a44a102",
  "88e1b927-7772-42fc-bad6-73cb5a44a103",
  "88e1b927-7772-42fc-bad6-73cb5a44a105",
]);

/** Moves these portrait sources down by roughly 20% so faces stay in frame. */
export function featurePortraitPosition(featureId: string) {
  return loweredPortraitIds.has(featureId)
    ? "object-[center_30%]"
    : "object-center";
}
