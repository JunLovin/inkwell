import { expect, test } from "@playwright/test";

test("dashboard home loads for authenticated user", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/dashboard/);
});

test("sidenav navigates to notes view", async ({ page }) => {
  await page.goto("/dashboard");
  await page.goto("/dashboard/notes");
  await expect(page).toHaveURL(/dashboard\/notes/);
});

test("sidenav navigates to favorites view", async ({ page }) => {
  await page.goto("/dashboard/favorite");
  await expect(page).toHaveURL(/dashboard\/favorite/);
});

test("sidenav navigates to archived view", async ({ page }) => {
  await page.goto("/dashboard/archived");
  await expect(page).toHaveURL(/dashboard\/archived/);
});

test("settings page is reachable", async ({ page }) => {
  await page.goto("/dashboard/settings");
  await expect(page).toHaveURL(/dashboard\/settings/);
});
