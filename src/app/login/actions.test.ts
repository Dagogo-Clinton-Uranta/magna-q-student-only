import { describe, expect, it } from "vitest";
import { parseCaptchaToken } from "@/lib/auth/turnstile";

describe("parseCaptchaToken", () => {
  it("does not require a Turnstile token when the site key is absent", () => {
    const previous = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    try {
      expect(parseCaptchaToken(new FormData())).toEqual({
        required: false,
        token: undefined,
      });
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      } else {
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = previous;
      }
    }
  });

  it("allows login when the widget is unavailable but no token was submitted", () => {
    const previous = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = "test-site-key";

    try {
      const form = new FormData();
      expect(parseCaptchaToken(form)).toEqual({
        required: false,
        token: undefined,
      });
    } finally {
      if (previous === undefined) {
        delete process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
      } else {
        process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY = previous;
      }
    }
  });
});
