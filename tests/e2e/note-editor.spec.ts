import { expect, test } from "@playwright/test";

test("navigating to a non-existent note slug stays under /dashboard", async ({
  page,
}) => {
  await page.goto("/dashboard/notes/does-not-exist");
  await page.waitForLoadState("networkidle").catch(() => undefined);
  await expect(page.url()).toContain("/dashboard");
});
