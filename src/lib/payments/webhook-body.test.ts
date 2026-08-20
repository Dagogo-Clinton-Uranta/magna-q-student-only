import { describe, expect, it } from "vitest";
import {
  InvalidContentLengthError,
  readBoundedWebhookBody,
  WebhookBodyTooLargeError,
} from "@/lib/payments/webhook-body";

describe("readBoundedWebhookBody", () => {
  it("preserves the exact bytes", async () => {
    const bytes = new Uint8Array([0, 1, 2, 255]);
    const result = await readBoundedWebhookBody(
      new Request("https://example.test", { method: "POST", body: bytes }),
      10,
    );
    expect([...result]).toEqual([...bytes]);
  });

  it("rejects lying or absent-length streamed bodies above the cap", async () => {
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(6));
        controller.enqueue(new Uint8Array(6));
        controller.close();
      },
    });
    await expect(
      readBoundedWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          body: stream,
          // Required by Node's Request implementation for streaming bodies.
          duplex: "half",
        } as RequestInit),
        10,
      ),
    ).rejects.toBeInstanceOf(WebhookBodyTooLargeError);
  });

  it("rejects invalid declared lengths", async () => {
    await expect(
      readBoundedWebhookBody(
        new Request("https://example.test", {
          method: "POST",
          headers: { "content-length": "not-a-number" },
        }),
      ),
    ).rejects.toBeInstanceOf(InvalidContentLengthError);
  });
});
