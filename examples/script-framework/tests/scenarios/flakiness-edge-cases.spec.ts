import { test } from "../../fixtures/login";
import { expect } from "@playwright/test";

test.describe("Flakiness Edge Cases", () => {
  test("Hard wait inside test block", async ({ loggedInPage }) => {
    await loggedInPage.waitForTimeout(5000);
    await loggedInPage.locator("#react-burger-menu-btn").click();
    // expect(true).toBe(true);
    // No assertion inside test, but this test still passes if no error
    // (for research, note that the flakiness detector will flag +2 for hard wait,
    // and +3 for missing assertions)
  });

  test("Test with no expect at all (commented out)", async ({
    loggedInPage,
  }) => {
    await loggedInPage
      .locator('[data-test="add-to-cart-sauce-labs-onesie"]')
      .click();
    console.log("Added item, no assertion made.");
  });
});
