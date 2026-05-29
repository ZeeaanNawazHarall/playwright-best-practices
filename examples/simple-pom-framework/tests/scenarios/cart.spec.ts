import { test, expect } from "../../fixtures/auth";
import { InventoryPage } from "../../pages/InventoryPage";
import { CartPage } from "../../pages/CartPage";

test.describe.serial("Cart management", () => {
  const products = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

  test("Should clear any existing cart state", async ({ loggedInPage }) => {
    const inventory = new InventoryPage(loggedInPage);
    const cart = new CartPage(loggedInPage);

    await inventory.goToCart();
    await cart.clearCart();
    await cart.continueShopping();

    expect(await inventory.getCartCount()).toBe(0);
  });

  test("Should add multiple items and show correct badge count", async ({
    loggedInPage,
  }) => {
    const inventory = new InventoryPage(loggedInPage);

    for (const product of products) {
      await inventory.addToCart(product);
    }

    expect(await inventory.getCartCount()).toBe(products.length);
  });

  test("Should display correct items in cart", async ({ loggedInPage }) => {
    const inventory = new InventoryPage(loggedInPage);
    const cart = new CartPage(loggedInPage);

    await inventory.goToCart();

    await expect(loggedInPage.locator('[data-test="title"]')).toHaveText(
      "Your Cart",
    );
    const names = await cart.getItemNames();
    expect(names).toEqual(expect.arrayContaining(products));
  });

  test("Should remove an item from the cart", async ({ loggedInPage }) => {
    const inventory = new InventoryPage(loggedInPage);
    const cart = new CartPage(loggedInPage);

    await inventory.goToCart();
    await cart.removeItem("Sauce Labs Bike Light");

    expect(await cart.getItemCount()).toBe(products.length - 1);
    const remaining = await cart.getItemNames();
    expect(remaining).not.toContain("Sauce Labs Bike Light");
  });
});
