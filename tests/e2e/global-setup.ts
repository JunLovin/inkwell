import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const STORAGE_PATH = "tests/e2e/.auth/user.json";
const EMAIL = `e2e+${Date.now()}@inkwell.test`;
const PASSWORD = "Test1234!";

setup("seed test user", async ({ page }) => {
  fs.mkdirSync(path.dirname(STORAGE_PATH), { recursive: true });

  await page.goto("/register");
  await page.getByLabel("Full name").fill("E2E User");
  await page.getByLabel("Email", { exact: true }).fill(EMAIL);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByLabel("Confirm password").fill(PASSWORD);
  await page.getByRole("button", { name: /create account/i }).click();

  await page.waitForURL(/dashboard/, { timeout: 30_000 });
  await expect(page).toHaveURL(/dashboard/);

  await page.context().storageState({ path: STORAGE_PATH });

  fs.writeFileSync(
    "tests/e2e/.auth/credentials.json",
    JSON.stringify({ email: EMAIL, password: PASSWORD }, null, 2),
  );
});
