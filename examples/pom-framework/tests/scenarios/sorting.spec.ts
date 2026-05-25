import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/login";
import { ProductsPage } from "../../pages/product/product.actions";

test.describe("Scenario 3: Product Sorting", () => {
  // let product: ProductsPage;

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

  // Helper to get fresh page objects for each test
  const getPages = (page: Page) => ({
    product: new ProductsPage(page),
  });

  // test.afterAll("Setup: Initialize page objects", async ({ loggedInPage }) => {
  //   product = new ProductsPage(loggedInPage);
  // });

  test("Should sort products A to Z", async ({ loggedInPage }) => {
    const { product } = getPages(loggedInPage);

    await product.sortProductsBy("az");
    const names = await product.getVisibleProductNames();
    assertSorted(names, true);
  });

  test("Should sort products Z to A", async ({ loggedInPage }) => {
    const { product } = getPages(loggedInPage);

    await product.sortProductsBy("za");
    const names = await product.getVisibleProductNames();
    assertSorted(names, false);
  });

  test("Should sort products by price low to high", async ({
    loggedInPage,
  }) => {
    const { product } = getPages(loggedInPage);

    await product.sortProductsBy("lohi");
    const prices = await product.getVisibleProductPrices();
    assertSorted(prices, true);
  });

  test("Should sort products by price high to low", async ({
    loggedInPage,
  }) => {
    const { product } = getPages(loggedInPage);

    await product.sortProductsBy("hilo");
    const prices = await product.getVisibleProductPrices();
    assertSorted(prices, false);
  });
});
