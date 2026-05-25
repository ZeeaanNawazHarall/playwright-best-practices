import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/login";

const fillCheckoutInfo = async (
  page: Page,
  firstName: string,
  lastName: string,
  zip: string,
) => {
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(zip);
  await page.locator('[data-test="continue"]').click();
  await page.waitForLoadState("domcontentloaded");
};

test.describe.serial("Scenario 2: Checkout Flow", () => {
  const productName = "Sauce Labs Bike Light";

  test("Should add item to cart", async ({ loggedInPage }) => {
    await loggedInPage
      .locator('[data-test="add-to-cart-sauce-labs-bike-light"]')
      .click();
    await expect(
      loggedInPage.locator('[data-test="shopping-cart-badge"]'),
    ).toHaveText("1");
  });

  test("Should display cart with item", async ({ loggedInPage }) => {
    await loggedInPage.locator(".shopping_cart_link").click();
    await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
      "Your Cart",
    );
    await expect(
      loggedInPage.locator('.cart_item [data-test="inventory-item-name"]'),
    ).toHaveText(productName);
  });

  test("Should proceed to checkout and fill info", async ({ loggedInPage }) => {
    await loggedInPage.locator('[data-test="checkout"]').click();
    await fillCheckoutInfo(loggedInPage, "Zeeaan", "Nawaz", "44000");

    await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
      "Checkout: Overview",
    );
  });

  test("Should complete order successfully", async ({ loggedInPage }) => {
    await loggedInPage.locator('[data-test="finish"]').click();
    await expect(
      loggedInPage.locator('[data-test="complete-header"]'),
    ).toHaveText("Thank you for your order!");
  });
});
