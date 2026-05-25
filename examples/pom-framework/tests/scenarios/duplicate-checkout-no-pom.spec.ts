// tests/duplicate-checkout-no-pom.spec.ts
import { test } from "../../fixtures/login";
import { expect } from "@playwright/test";

test.describe.serial("Duplicate Checkout Flow (Script-based)", () => {
  const productName = "Sauce Labs Bike Light";

  test("Should add item to cart and verify badge", async ({ loggedInPage }) => {
    const page = loggedInPage;
    // Direct selectors – no page objects
    await page
      .locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
      .click();
    await page.waitForTimeout(200); // intentional hard wait
    const badge = page.locator('[data-test="shopping-cart-badge"]');
    await expect(badge).toHaveText("1");
  });

  test("Should display cart with item", async ({ loggedInPage }) => {
    const page = loggedInPage;
    await page.locator(".shopping_cart_link").click();
    await expect(page.locator('[data-test="title"]')).toContainText(
      "Your Cart",
    );
    const itemName = page.locator(
      '.cart_item [data-test="inventory-item-name"]',
    );
    await expect(itemName).toHaveText(productName);
  });

  test("Should proceed to checkout and fill info", async ({ loggedInPage }) => {
    const page = loggedInPage;
    await page.locator(".shopping_cart_link").click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill("Zeeaan");
    await page.locator('[data-test="lastName"]').fill("Nawaz");
    await page.locator('[data-test="postalCode"]').fill("44000");
    await page.locator('[data-test="continue"]').click();
    await expect(page.locator('[data-test="title"]')).toContainText(
      "Checkout: Overview",
    );
  });

  test("Should complete order", async ({ loggedInPage }) => {
    const page = loggedInPage;
    // Repeat the whole flow as in a real script-based approach
    await page.goto("/inventory.html");
    await page
      .locator('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]')
      .click();
    await page.locator(".shopping_cart_link").click();
    await page.locator('[data-test="checkout"]').click();
    await page.locator('[data-test="firstName"]').fill("Zeeaan");
    await page.locator('[data-test="lastName"]').fill("Nawaz");
    await page.locator('[data-test="postalCode"]').fill("44000");
    await page.locator('[data-test="continue"]').click();
    await page.locator('[data-test="finish"]').click();
    await expect(page.locator('[data-test="complete-header"]')).toHaveText(
      "Thank you for your order!",
    );
  });
});
