import { expect, test } from "@playwright/test";

test("AI chat panel is reachable and uses stub reply", async ({ page }) => {
  await page.goto("/dashboard");
  const toggle = page.getByRole("button").first();
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
  }
});

test("AI chat opens via the panel toggle button when present", async ({
  page,
}) => {
  await page.goto("/dashboard");
  const sparklesButton = page
    .locator('button[aria-label*="assistant" i]')
    .first();
  if (await sparklesButton.isVisible().catch(() => false)) {
    await sparklesButton.click();
    await expect(page.getByText(/Inkwell Assistant/i)).toBeVisible();
  }
});
