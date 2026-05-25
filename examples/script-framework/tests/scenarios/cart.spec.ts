import { expect } from "@playwright/test";
import { test } from "../../fixtures/login";

const cartBadgeCount = async (page: any) => {
  const badge = page.locator('[data-test="shopping-cart-badge"]');
  if ((await badge.count()) === 0) return 0;
  return Number((await badge.innerText()).trim()) || 0;
};

const clearCart = async (page: any) => {
  while (
    await page.locator('.cart_item button[data-test^="remove-"]').count()
  ) {
    await page
      .locator('.cart_item button[data-test^="remove-"]')
      .first()
      .click();
    await page.waitForTimeout(300);
  }
};

const getCartItemNames = async (page: any) => {
  return page
    .locator('.cart_item [data-test="inventory-item-name"]')
    .allInnerTexts();
};

const getCartItemPrices = async (page: any): Promise<number[]> => {
  const texts = await page
    .locator('.cart_item [data-test="inventory-item-price"]')
    .allInnerTexts();
  return texts.map((price: string) => Number(price.replace(/[^0-9.]/g, "")));
};

const removeItemFromCart = async (page: any, productName: string) => {
  const productRow = page.locator(
    `[data-test="inventory-item"]:has([data-test="inventory-item-name"]:has-text("${productName}"))`,
  );
  await productRow.locator('button[data-test^="remove-"]').click();
  await page.waitForTimeout(300);
};

const getCartItemCount = async (page: any) => {
  return page.locator(".cart_item").count();
};

const fillCheckoutInfo = async (
  page: any,
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

const getSummaryTotals = async (page: any) => ({
  itemTotal: await page.locator('[data-test="subtotal-label"]').innerText(),
  tax: await page.locator('[data-test="tax-label"]').innerText(),
  total: await page.locator('[data-test="total-label"]').innerText(),
});

const addItemToCart = async (page: any, productName: string) => {
  const productItem = page.locator('[data-test="inventory-item"]').filter({
    has: page.locator(
      `[data-test="inventory-item-name"]:has-text("${productName}")`,
    ),
  });
  await productItem
    .locator('button[data-test^="add-to-cart-"]')
    .first()
    .click();
};

const addItemsToCart = async (page: any, products: string[]) => {
  for (const product of products) {
    await addItemToCart(page, product);
  }
};

test.describe.serial("Scenario 4: Cart Management", () => {
  const selectedProducts = [
    "Sauce Labs Backpack",
    "Sauce Labs Bike Light",
    "Sauce Labs Onesie",
  ];

  test("Should clear existing cart items", async ({ loggedInPage }) => {
    await loggedInPage.locator(".shopping_cart_link").click();
    await clearCart(loggedInPage);
    await loggedInPage.locator('[data-test="continue-shopping"]').click();
    expect(await cartBadgeCount(loggedInPage)).toBe(0);
  });

  test("Should add multiple products to cart", async ({ loggedInPage }) => {
    await addItemsToCart(loggedInPage, selectedProducts);
    await loggedInPage.waitForTimeout(300);
    expect(await cartBadgeCount(loggedInPage)).toBe(selectedProducts.length);
  });

  test("Should display all items in cart with correct details", async ({
    loggedInPage,
  }) => {
    await loggedInPage.locator(".shopping_cart_link").click();
    expect(await loggedInPage.locator('[data-test="title"]').innerText()).toBe(
      "Your Cart",
    );

    const names = await getCartItemNames(loggedInPage);
    expect(names.length).toBe(selectedProducts.length);
    expect(names).toEqual(expect.arrayContaining(selectedProducts));
  });

  test("Should verify item total matches sum of prices", async ({
    loggedInPage,
  }) => {
    const prices = await getCartItemPrices(loggedInPage);
    const expectedTotal = prices.reduce(
      (sum: number, value: number) => sum + value,
      0,
    );

    await loggedInPage.locator('[data-test="checkout"]').click();
    await fillCheckoutInfo(loggedInPage, "Zeeaan", "Nawaz", "44000");

    const summary = await getSummaryTotals(loggedInPage);
    expect(summary.itemTotal).toBe(`Item total: $${expectedTotal.toFixed(2)}`);

    await loggedInPage.locator('[data-test="cancel"]').click();
  });

  test("Should remove item from cart", async ({ loggedInPage }) => {
    await loggedInPage.locator(".shopping_cart_link").click();
    await removeItemFromCart(loggedInPage, "Sauce Labs Bike Light");
    await loggedInPage.waitForTimeout(300);

    expect(await getCartItemCount(loggedInPage)).toBe(
      selectedProducts.length - 1,
    );
    expect(await cartBadgeCount(loggedInPage)).toBe(
      selectedProducts.length - 1,
    );
  });

  test("Should verify remaining items after removal", async ({
    loggedInPage,
  }) => {
    const remainingItems = await getCartItemNames(loggedInPage);
    expect(remainingItems).toEqual(
      expect.arrayContaining(["Sauce Labs Backpack", "Sauce Labs Onesie"]),
    );
    expect(remainingItems).not.toContain("Sauce Labs Bike Light");
  });

  test("Should update cart badge after navigation", async ({
    loggedInPage,
  }) => {
    expect(await cartBadgeCount(loggedInPage)).toBe(
      selectedProducts.length - 1,
    );
  });

  test("Should verify total price after item removal", async ({
    loggedInPage,
  }) => {
    const remainingPrices = await getCartItemPrices(loggedInPage);
    const expectedTotalAfterRemoval = remainingPrices.reduce(
      (sum: number, value: number) => sum + value,
      0,
    );

    await loggedInPage.locator('[data-test="checkout"]').click();
    await fillCheckoutInfo(loggedInPage, "Zeeaan", "Nawaz", "44000");

    const summary = await getSummaryTotals(loggedInPage);
    expect(summary.itemTotal).toBe(
      `Item total: $${expectedTotalAfterRemoval.toFixed(2)}`,
    );
    await loggedInPage.locator('[data-test="cancel"]').click();
    expect(await cartBadgeCount(loggedInPage)).toBe(
      selectedProducts.length - 1,
    );
  });
});
