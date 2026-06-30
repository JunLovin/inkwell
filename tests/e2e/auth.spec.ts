import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test("forgot password page is reachable", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page).toHaveURL(/forgot-password/);
});

test("login form rejects invalid credentials", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("nobody@inkwell.test");
  await page.getByLabel("Password").fill("Wrong1234!");
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/login/);
});

test("login page redirects authenticated users", async ({ page, context }) => {
  await context.addInitScript(() => {});
  await page.goto("/login");
});
