import { expect, test } from "@playwright/test";

test("landing page presents the IMG value proposition", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "US-style clinical questions",
  );
  await expect(
    page.getByRole("link", { name: "Start practicing" }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A focused practice loop" }),
  ).toBeVisible();
  await expect(
    page.getByText("Sample testimonials", { exact: true }),
  ).toBeVisible();
});

test("the login page exposes only student access", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Student access", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Password")).toHaveCount(0);
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("demo mode bypasses protected-route login", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByText("Student access", { exact: true })).toBeVisible();
  await page.goto("/dashboard");
  await expect(
    page.getByRole("heading", { name: "Student dashboard" }),
  ).toBeVisible();
});
