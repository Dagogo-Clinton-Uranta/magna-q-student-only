export const MAX_STRIPE_WEBHOOK_BYTES = 1024 * 1024;

export class WebhookBodyTooLargeError extends Error {}
export class InvalidContentLengthError extends Error {}

/** Reads the exact signed bytes while enforcing a cap for chunked bodies too. */
export async function readBoundedWebhookBody(
  request: Request,
  maxBytes = MAX_STRIPE_WEBHOOK_BYTES,
) {
  const declared = request.headers.get("content-length");
  if (declared !== null) {
    const length = Number(declared);
    if (!Number.isSafeInteger(length) || length < 0)
      throw new InvalidContentLengthError("Invalid Content-Length.");
    if (length > maxBytes)
      throw new WebhookBodyTooLargeError("Webhook body is too large.");
  }

  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > maxBytes) {
      await reader.cancel().catch(() => undefined);
      throw new WebhookBodyTooLargeError("Webhook body is too large.");
    }
    chunks.push(value);
  }

  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}
