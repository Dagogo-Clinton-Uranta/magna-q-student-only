import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";

const profanityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;
const urlPattern =
  /(?:https?:\/\/|www\.|\b[a-z0-9-]+\.(?:com|org|net|edu|gov|io|co|me|app|dev|info)\b)/i;
const phonePattern = /(?:\+?\d[\s().-]*){7,}/;

export type FeatureCommentModeration = {
  accepted: boolean;
  reasons: string[];
};

export function moderateFeatureComment(
  content: string,
): FeatureCommentModeration {
  const text = content.trim();
  const reasons: string[] = [];
  if (!text || text.length > 2_000) reasons.push("Invalid comment length");
  if (emailPattern.test(text)) reasons.push("Email addresses are not allowed");
  if (phonePattern.test(text)) reasons.push("Phone numbers are not allowed");
  if (urlPattern.test(text)) reasons.push("External links are not allowed");
  if (profanityMatcher.hasMatch(text)) reasons.push("Profanity is not allowed");
  return { accepted: reasons.length === 0, reasons };
}

export function mentionedUsernames(content: string) {
  return [
    ...new Set(
      [...content.matchAll(/(?:^|\s)@([a-z0-9_]{3,24})\b/gi)].map((match) =>
        (match[1] ?? "").toLowerCase(),
      ),
    ),
  ];
}
