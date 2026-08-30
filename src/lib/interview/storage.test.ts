import { afterEach, describe, expect, it } from "vitest";
import { getInterviewStorageConfig } from "./storage";

const original = { ...process.env };

afterEach(() => {
  process.env = { ...original };
});

describe("Cloudflare R2 interview storage", () => {
  it("stays disabled until all private credentials are configured", () => {
    delete process.env.CLOUDFLARE_R2_ACCOUNT_ID;
    delete process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
    delete process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;
    delete process.env.CLOUDFLARE_R2_BUCKET;
    expect(getInterviewStorageConfig()).toBeNull();
  });

  it("derives the account-scoped R2 S3 endpoint", () => {
    process.env.CLOUDFLARE_R2_ACCOUNT_ID = "account-123";
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = "access-key";
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = "secret-key";
    process.env.CLOUDFLARE_R2_BUCKET = "interview-videos";

    expect(getInterviewStorageConfig()).toMatchObject({
      bucket: "interview-videos",
      endpoint: "https://account-123.r2.cloudflarestorage.com",
    });
  });
});
