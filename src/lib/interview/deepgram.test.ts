import { describe, expect, it } from "vitest";
import { parseDeepgramTranscript } from "./deepgram";

describe("Deepgram transcript persistence shape", () => {
  it("extracts transcript metadata and word timestamps", () => {
    const result = parseDeepgramTranscript({
      metadata: { request_id: "request-1", duration: 2 },
      results: { channels: [{ alternatives: [{ transcript: "Patient safety", confidence: 0.95, words: [
        { word: "Patient", start: 0, end: 0.5 }, { word: "safety", start: 0.7, end: 1.2 },
      ] }] }] },
    });
    expect(result.requestId).toBe("request-1");
    expect(result.transcript).toBe("Patient safety");
    expect(result.words).toHaveLength(2);
  });

  it("refuses to invent a transcript from empty provider output", () => {
    expect(() => parseDeepgramTranscript({ results: { channels: [] } })).toThrow("NO_USABLE_TRANSCRIPT");
  });
});
