import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "npm run start -- --hostname 127.0.0.1 --port 3417",
    url: "http://127.0.0.1:3417",
    reuseExistingServer: false,
    env: {
      NEXT_PUBLIC_APP_URL: "http://127.0.0.1:3417",
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "aaaaaaaaaaaaaaaaaaaa",
    },
  },
  use: { baseURL: "http://127.0.0.1:3417", trace: "on-first-retry" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
