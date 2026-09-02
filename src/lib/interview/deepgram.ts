import { DeepgramClient } from "@deepgram/sdk";
import {
  calculateDeliveryMetrics,
  type TranscriptWord,
} from "./delivery-metrics";

const commonKeyterms = [
  "residency",
  "USMLE",
  "SOAP",
  "ACGME",
  "patient safety",
  "handoff",
  "electronic health record",
  "informed consent",
  "quality improvement",
];
const specialtyKeyterms: Record<string, string[]> = {
  "internal-medicine": ["Internal Medicine", "hospitalist", "multimorbidity"],
  surgery: ["perioperative", "postoperative", "surgical consent"],
  pediatrics: ["pediatrics", "guardian", "developmental milestones"],
  psychiatry: ["psychiatry", "mental status examination", "capacity"],
  "emergency-medicine": ["triage", "resuscitation", "Emergency Medicine"],
  "family-medicine": [
    "continuity of care",
    "Family Medicine",
    "preventive care",
  ],
};

export function specialtyTermsFor(specialty: string | null | undefined) {
  return specialty ? (specialtyKeyterms[specialty] ?? []) : [];
}

export type InterviewTranscript = {
  transcript: string;
  words: TranscriptWord[];
  confidence: number | null;
  durationSeconds: number;
  requestId: string | null;
  deliveryMetrics: ReturnType<typeof calculateDeliveryMetrics>;
};

export async function transcribeInterviewFile(
  file: Buffer,
  _contentType: string,
  specialtyTerms: string[] = [],
) {
  const response = await clientForInterview().listen.v1.media.transcribeFile(
    file,
    {
      model: "nova-3",
      language: "en",
      smart_format: true,
      filler_words: true,
      keyterm: [...commonKeyterms, ...specialtyTerms].slice(0, 30),
    },
  );
  return parseDeepgramTranscript(response);
}

export async function transcribeInterviewUrl(
  url: string,
  specialtyTerms: string[] = [],
) {
  const response = await clientForInterview().listen.v1.media.transcribeUrl({
    url,
    model: "nova-3",
    language: "en",
    smart_format: true,
    filler_words: true,
    keyterm: [...commonKeyterms, ...specialtyTerms].slice(0, 30),
  });
  return parseDeepgramTranscript(response);
}

export function parseDeepgramTranscript(
  response: unknown,
): InterviewTranscript {
  const body = response as {
    metadata?: { request_id?: string; duration?: number };
    results?: {
      channels?: Array<{
        alternatives?: Array<{
          transcript?: string;
          confidence?: number;
          words?: TranscriptWord[];
        }>;
      }>;
    };
  };
  const alternative = body.results?.channels?.[0]?.alternatives?.[0];
  const transcript = alternative?.transcript?.trim() ?? "";
  const words = (alternative?.words ?? []).filter(
    (word) =>
      typeof word.word === "string" &&
      Number.isFinite(word.start) &&
      Number.isFinite(word.end),
  );
  const durationSeconds = body.metadata?.duration ?? words.at(-1)?.end ?? 0;
  if (!transcript || words.length === 0)
    throw new Error("NO_USABLE_TRANSCRIPT");
  return {
    transcript,
    words,
    confidence: Number.isFinite(alternative?.confidence)
      ? alternative!.confidence!
      : null,
    durationSeconds,
    requestId: body.metadata?.request_id ?? null,
    deliveryMetrics: calculateDeliveryMetrics(words, durationSeconds),
  };
}

function clientForInterview() {
  const apiKey = process.env.DEEPGRAM_API_KEY;
  if (!apiKey) throw new Error("DEEPGRAM_NOT_CONFIGURED");
  return new DeepgramClient({ apiKey });
}
