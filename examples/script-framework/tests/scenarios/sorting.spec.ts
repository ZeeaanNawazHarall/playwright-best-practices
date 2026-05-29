import { expect } from "@playwright/test";
import { test } from "../../fixtures/login";

const assertSorted = (values: string[] | number[], expectedAsc: boolean) => {
  const sorted = [...values].sort((a, b) => {
    if (typeof a === "number" && typeof b === "number") {
      return a - b;
    }
    return a.toString().localeCompare(b.toString());
  });
  if (!expectedAsc) {
    sorted.reverse();
  }
  expect(values).toEqual(sorted);
};

const getVisibleProductNames = async (page: any) => {
  return page.locator('[data-test="inventory-item-name"]').allInnerTexts();
};

const getVisibleProductPrices = async (page: any) => {
  const texts = await page
    .locator('[data-test="inventory-item-price"]')
    .allInnerTexts();
  return texts.map((price: string) => Number(price.replace(/[^0-9.]/g, "")));
};

test.describe("Scenario 3: Product Sorting", () => {
  test("Should sort products A to Z", async ({ loggedInPage }) => {
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="product-sort-container"]')
      .selectOption("az");
    const names = await getVisibleProductNames(loggedInPage);
    assertSorted(names, true);
  });

  test("Should sort products Z to A", async ({ loggedInPage }) => {
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="product-sort-container"]')
      .selectOption("za");
    const names = await getVisibleProductNames(loggedInPage);
    assertSorted(names, false);
  });

  test("Should sort products by price low to high", async ({
    loggedInPage,
  }) => {
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="product-sort-container"]')
      .selectOption("lohi");
    const prices = await getVisibleProductPrices(loggedInPage);
    assertSorted(prices, true);
  });

  test("Should sort products by price high to low", async ({
    loggedInPage,
  }) => {
    await loggedInPage.goto("/inventory.html");
    await loggedInPage
      .locator('[data-test="product-sort-container"]')
      .selectOption("hilo");
    const prices = await getVisibleProductPrices(loggedInPage);
    assertSorted(prices, false);
  });
});
