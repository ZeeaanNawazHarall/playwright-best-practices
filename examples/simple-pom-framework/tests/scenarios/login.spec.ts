import { test, expect } from "../../fixtures/auth";

test("Should land on inventory page after login", async ({ loggedInPage }) => {
  await loggedInPage.goto("/inventory.html");
  await expect(loggedInPage.locator('[data-test="title"]')).toHaveText(
    "Products",
  );
  await expect(loggedInPage).toHaveURL(/inventory/);
});
