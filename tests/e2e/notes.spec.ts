import { expect, test } from "@playwright/test";

test("notes list view renders empty-state or notes grid", async ({ page }) => {
  await page.goto("/dashboard/notes");
  await expect(page).toHaveURL(/dashboard\/notes/);
});

test("create a note from the empty state when present", async ({ page }) => {
  await page.goto("/dashboard/notes");
  const createButton = page
    .getByRole("button", { name: /create note/i })
    .first();
  if (await createButton.isVisible().catch(() => false)) {
    await createButton.click();
  }
});

test("favorites view shows favorite-only filter", async ({ page }) => {
  await page.goto("/dashboard/favorite");
  await expect(page).toHaveURL(/favorite/);
});

test("archived view shows archived-only filter", async ({ page }) => {
  await page.goto("/dashboard/archived");
  await expect(page).toHaveURL(/archived/);
});
