import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/login";

const addItemToCart = async (page: Page, productName: string) => {
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

const getCartItemNames = async (page: Page) => {
  return await page
    .locator('.cart_item [data-test="inventory-item-name"]')
    .allInnerTexts();
};

const getCartDetails = async (page: Page) => ({
  title: await page.locator('[data-test="title"]').innerText(),
  items: await getCartItemNames(page),
});

const performSortAddAndVerify = async (
  page: Page,
  sortOption: "az" | "za" | "lohi" | "hilo",
  itemsToAdd: string[],
  expectedBadgeCount: number,
) => {
  await page
    .locator('[data-test="product-sort-container"]')
    .selectOption(sortOption);

  for (const item of itemsToAdd) {
    await addItemToCart(page, item);
  }

  const badge = page.locator('[data-test="shopping-cart-badge"]');
  await expect(badge).toHaveText(`${expectedBadgeCount}`);
};

test("Scenario 1: Login with Valid Credentials", async ({ loggedInPage }) => {
  await loggedInPage.goto("/inventory.html");
  await expect(loggedInPage.locator('[data-test="title"]')).toHaveText(
    "Products",
  );
});

test("Quick smoke test (non-POM)", async ({ loggedInPage }) => {
  await loggedInPage.goto("/inventory.html");
  await loggedInPage.locator('[data-test="shopping-cart-link"]').click();
  await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
    "Your Cart",
  );
});

test("Complex method: sort, add multiple, verify", async ({ loggedInPage }) => {
  const page = loggedInPage;
  await page.goto("/inventory.html");

  await performSortAddAndVerify(
    page,
    "lohi",
    ["Sauce Labs Backpack", "Sauce Labs Bike Light"],
    2,
  );

  await page.locator('[data-test="shopping-cart-link"]').click();
  const cartDetails = await getCartDetails(page);

  expect(cartDetails.title).toBe("Your Cart");
  expect(cartDetails.items.length).toBe(2);
  expect(cartDetails.items).toEqual(
    expect.arrayContaining(["Sauce Labs Backpack", "Sauce Labs Bike Light"]),
  );
});
