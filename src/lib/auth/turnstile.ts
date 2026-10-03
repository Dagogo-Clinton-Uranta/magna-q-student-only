export function parseCaptchaToken(formData: FormData): {
  required: boolean;
  token?: string;
  error?: string;
} {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (!siteKey) {
    return { required: false, token: undefined };
  }

  const token = formData.get("cf-turnstile-response");
  if (token === null) {
    return { required: false, token: undefined };
  }

  if (typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return {
      required: true,
      error: "Complete the human verification and try again.",
    };
  }

  return { required: true, token };
}
