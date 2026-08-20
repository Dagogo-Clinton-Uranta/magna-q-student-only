import {
  englishDataset,
  englishRecommendedTransformers,
  RegExpMatcher,
} from "obscenity";
import type { ModerationStatus } from "@/lib/chat/types";

const obscenityMatcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

// This phrase library deliberately covers sexual solicitation, doxxing, threats,
// and other high-risk language. Add locale-specific phrases here as policy evolves.
const phraseRules = [
  {
    pattern:
      /(?:send|share|post)\s+(?:your\s+)?(?:address|phone number|home address|location)/i,
    score: 6,
    reason: "Possible doxxing",
  },
  {
    pattern: /(?:nudes?|naked pics?|send pics?|hook ?up|sext(?:ing)?)/i,
    score: 6,
    reason: "Sexual or suggestive content",
  },
  {
    pattern: /(?:i(?:'| a)m going to|i will)\s+(?:kill|hurt|rape|beat)\b/i,
    score: 7,
    reason: "Threatening language",
  },
  {
    pattern: /(?:suicide|kill myself|self harm)/i,
    score: 5,
    reason: "Self-harm reference",
  },
  {
    pattern:
      /(?:credit card|bank account|social security number|password)\s*(?:is|:)/i,
    score: 5,
    reason: "Sensitive personal information",
  },
] as const;

export type RiskAssessment = {
  status: ModerationStatus;
  score: number;
  reasons: string[];
  requiresAiReview: boolean;
};

export function assessMessageRisk(content: string): RiskAssessment {
  const text = content.trim();
  if (!text || text.length > 2_000)
    return {
      status: "rejected",
      score: 8,
      reasons: [!text ? "Empty message" : "Message exceeds maximum length"],
      requiresAiReview: false,
    };
  if (obscenityMatcher.hasMatch(text))
    return {
      status: "rejected",
      score: 8,
      reasons: ["Profanity or obscenity detected"],
      requiresAiReview: false,
    };

  const matches = phraseRules.filter((rule) => rule.pattern.test(text));
  const score =
    matches.reduce((total, rule) => total + rule.score, 0) +
    ((text.match(/https?:\/\/|www\./gi)?.length ?? 0) >= 2 ? 2 : 0);
  const reasons = matches.map((rule) => rule.reason);
  if (score >= 8)
    return { status: "rejected", score, reasons, requiresAiReview: false };
  if (score >= 5)
    return { status: "pending", score, reasons, requiresAiReview: true };
  return { status: "accepted", score, reasons, requiresAiReview: false };
}
