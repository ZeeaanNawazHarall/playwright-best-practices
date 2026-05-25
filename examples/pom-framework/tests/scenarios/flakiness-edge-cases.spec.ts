// tests/flakiness-edge-cases.spec.ts
import { test } from "../../fixtures/login";
import { ProductsPage } from "../../pages/product/product.actions";

test.describe("Flakiness Edge Cases", () => {
  test("Hard wait inside test block", async ({ loggedInPage }) => {
    // Direct wait (smell)
    await loggedInPage.waitForTimeout(5000);
    // Open menu
    await loggedInPage.locator("#react-burger-menu-btn").click();
    // No assertion inside test, but this test still passes if no error
    // (for research, note that the flakiness detector will flag +2 for hard wait,
    // and +3 for missing assertions)
  });

  test("Test with no expect at all (commented out)", async ({
    loggedInPage,
  }) => {
    // This test does something but never checks results
    const product = new ProductsPage(loggedInPage);
    await product.addItemToCart("Sauce Labs Onesie");
    // expect(await product.getCartBadgeCount()).toBe(1); // removed intentionally
    // Instead, we just log:
    console.log("Added item, no assertion made.");
    // The extension's flakiness detector should flag +3 missing assertions
  });
});
