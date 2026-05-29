import { test } from "../../fixtures/login";
import { expect } from "@playwright/test";

test.describe.serial("Duplicate Checkout Flow (Script-based)", () => {
  const productName = "Sauce Labs Bike Light";

  test("Should add item to cart and verify badge", async ({ loggedInPage }) => {
    // Checkout from the previous test file empties the cart; just navigate to inventory
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
      .click();
    const badge = loggedInPage.locator('[data-test="shopping-cart-badge"]');
    await expect(badge).toHaveText("1");
  });

  test("Should display cart with item", async ({ loggedInPage }) => {
    await loggedInPage.locator('[data-test="shopping-cart-link"]').click();
    await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
      "Your Cart",
    );
    await expect(
      loggedInPage.locator('[data-test="inventory-item"] [data-test="inventory-item-name"]'),
    ).toHaveText(productName);
  });

  test("Should proceed to checkout and fill info", async ({ loggedInPage }) => {
    await loggedInPage.locator('[data-test="shopping-cart-link"]').click();
    await loggedInPage.locator('[data-test="checkout"]').click();
    await loggedInPage.locator('[data-test="firstName"]').fill("Zeeaan");
    await loggedInPage.locator('[data-test="lastName"]').fill("Nawaz");
    await loggedInPage.locator('[data-test="postalCode"]').fill("44000");
    await loggedInPage.locator('[data-test="continue"]').click();
    await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
      "Checkout: Overview",
    );
  });

  test("Should complete order", async ({ loggedInPage }) => {
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="add-to-cart-test.allthethings()-t-shirt-(red)"]')
      .click();
    await loggedInPage.locator('[data-test="shopping-cart-link"]').click();
    await loggedInPage.locator('[data-test="checkout"]').click();
    await loggedInPage.locator('[data-test="firstName"]').fill("Zeeaan");
    await loggedInPage.locator('[data-test="lastName"]').fill("Nawaz");
    await loggedInPage.locator('[data-test="postalCode"]').fill("44000");
    await loggedInPage.locator('[data-test="continue"]').click();
    await loggedInPage.locator('[data-test="finish"]').click();
    await expect(
      loggedInPage.locator('[data-test="complete-header"]'),
    ).toHaveText("Thank you for your order!");
  });
});
