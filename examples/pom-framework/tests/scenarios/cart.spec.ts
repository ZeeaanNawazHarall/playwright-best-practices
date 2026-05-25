import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/login";
import { CartPage } from "../../pages/cart/cart.actions";
import { ProductsPage } from "../../pages/product/product.actions";
import { CheckoutPage } from "../../pages/checkout/checkout.actions";

test.describe.serial("Scenario 4: Cart Management", () => {
  const selectedProducts = [
    "Sauce Labs Backpack",
    "Sauce Labs Bike Light",
    "Sauce Labs Onesie",
  ];
  // let product: ProductsPage;
  // let cart: CartPage;
  // let checkout: CheckoutPage;
  // let page: any;

  // test.beforeAll("Setup: Initialize page objects", async ({ loggedInPage }) => {
  //   page = loggedInPage;
  //   product = new ProductsPage(page);
  //   cart = new CartPage(page);
  //   checkout = new CheckoutPage(page);
  // });

  // Helper to get fresh page objects for each test
  const getPages = (page: Page) => ({
    product: new ProductsPage(page),
    cart: new CartPage(page),
    checkout: new CheckoutPage(page),
  });

  test("Should clear existing cart items", async ({ loggedInPage }) => {
    const { product, cart } = getPages(loggedInPage);

    await product.goToCart();
    await cart.clearCart();
    await cart.continueShopping();

    expect(await product.getCartBadgeCount()).toBe(0);
  });

  test("Should add multiple products to cart", async ({ loggedInPage }) => {
    const { product } = getPages(loggedInPage);

    await product.addItemsToCart(selectedProducts);
    await loggedInPage.waitForTimeout(300);

    expect(await product.getCartBadgeCount()).toBe(selectedProducts.length);
  });

  test("Should display all items in cart with correct details", async ({
    loggedInPage,
  }) => {
    const { product, cart } = getPages(loggedInPage);

    await product.goToCart();
    expect(await cart.getCartTitle()).toBe("Your Cart");

    const cartItemNames = await cart.getCartItemNames();
    expect(cartItemNames.length).toBe(selectedProducts.length);
    expect(cartItemNames).toEqual(expect.arrayContaining(selectedProducts));
  });

  test("Should verify item total matches sum of prices", async ({
    loggedInPage,
  }) => {
    const { checkout, cart } = getPages(loggedInPage);

    const cartPrices = await cart.getCartItemPrices();
    const expectedCartTotal = cartPrices.reduce((sum, price) => sum + price, 0);

    await cart.proceedToCheckout();
    await checkout.fillCheckoutInfo("Zeeaan", "Nawaz", "44000");

    const summaryTotals = await checkout.getSummaryTotals();
    expect(summaryTotals.itemTotal).toBe(
      `Item total: $${expectedCartTotal.toFixed(2)}`,
    );

    await checkout.cancelCheckout();
  });

  test("Should remove item from cart", async ({ loggedInPage }) => {
    const { product, cart } = getPages(loggedInPage);

    await product.goToCart();
    await cart.removeItemFromCart("Sauce Labs Bike Light");
    await loggedInPage.waitForTimeout(300);

    expect(await cart.getCartItemCount()).toBe(selectedProducts.length - 1);
    expect(await cart.getCartBadgeCount()).toBe(selectedProducts.length - 1);
  });

  test("Should verify remaining items after removal", async ({
    loggedInPage,
  }) => {
    const { cart } = getPages(loggedInPage);

    const remainingItems = await cart.getCartItemNames();
    expect(remainingItems).toEqual(
      expect.arrayContaining(["Sauce Labs Backpack", "Sauce Labs Onesie"]),
    );
    expect(remainingItems).not.toContain("Sauce Labs Bike Light");
  });

  test("Should update cart badge after navigation", async ({
    loggedInPage,
  }) => {
    const { product } = getPages(loggedInPage);

    expect(await product.getCartBadgeCount()).toBe(selectedProducts.length - 1);
  });

  test("Should verify total price after item removal", async ({
    loggedInPage,
  }) => {
    const { checkout, product, cart } = getPages(loggedInPage);

    const remainingPrices = await cart.getCartItemPrices();
    const expectedTotalAfterRemoval = remainingPrices.reduce(
      (sum, price) => sum + price,
      0,
    );

    await cart.proceedToCheckout();
    await checkout.fillCheckoutInfo("Zeeaan", "Nawaz", "44000");

    const summaryTotalsAfterRemoval = await checkout.getSummaryTotals();
    expect(summaryTotalsAfterRemoval.itemTotal).toBe(
      `Item total: $${expectedTotalAfterRemoval.toFixed(2)}`,
    );

    await checkout.cancelCheckout();
    expect(await product.getCartBadgeCount()).toBe(selectedProducts.length - 1);
  });
});
