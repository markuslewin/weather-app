import { test, expect } from "@playwright/test";

test("displays name", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(
    /markus/i
  );
});
