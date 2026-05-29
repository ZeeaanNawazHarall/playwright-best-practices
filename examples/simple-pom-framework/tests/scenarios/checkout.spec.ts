import { test, expect } from "../../fixtures/auth";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";
import { CheckoutPage } from "../../pages/CheckoutPage";

test.describe.serial("Checkout flow", () => {
  const productName = "Sauce Labs Bike Light";

  test("Should add item to cart", async ({ loggedInPage }) => {
    const inventory = new InventoryPage(loggedInPage);

    await inventory.goToCart();
    const cart = new CartPage(loggedInPage);
    await cart.clearCart();
    await cart.continueShopping();

    await inventory.addToCart(productName);
    expect(await inventory.getCartCount()).toBe(1);
  });

  test("Should display item in cart", async ({ loggedInPage }) => {
    const inventory = new InventoryPage(loggedInPage);
    const cart = new CartPage(loggedInPage);

    await inventory.goToCart();

    expect(await cart.getTitle()).toBe("Your Cart");
    const names = await cart.getItemNames();
    expect(names).toContain(productName);
  });

  test("Should complete checkout with valid info", async ({ loggedInPage }) => {
    const cart = new CartPage(loggedInPage);
    const checkout = new CheckoutPage(loggedInPage);

    await cart.proceedToCheckout();
    await checkout.fillInfo("Jane", "Doe", "10001");

    await expect(loggedInPage.locator('[data-test="title"]')).toHaveText(
      "Checkout: Overview",
    );
  });

  test("Should show order confirmation after finishing", async ({
    loggedInPage,
  }) => {
    const checkout = new CheckoutPage(loggedInPage);

    await checkout.finish();

    expect(await checkout.getConfirmationMessage()).toBe(
      "Thank you for your order!",
    );
  });
});
