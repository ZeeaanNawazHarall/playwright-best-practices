import { expect, Page } from "@playwright/test";
import { test } from "../../fixtures/login";
import { CartPage } from "../../pages/cart/cart.actions";
import { ProductsPage } from "../../pages/product/product.actions";
import { CheckoutPage } from "../../pages/checkout/checkout.actions";

test.describe.serial("Scenario 2: Checkout Flow", () => {
  const productName = "Sauce Labs Bike Light";

  const getPages = (page: Page) => ({
    product: new ProductsPage(page),
    cart: new CartPage(page),
    checkout: new CheckoutPage(page),
  });

  test("Should add item to cart", async ({ loggedInPage }) => {
    const { product } = getPages(loggedInPage);

    await product.addItemToCart(productName);
    expect(await product.getCartBadgeCount()).toBe(1);
  });

  test("Should display cart with item", async ({ loggedInPage }) => {
    const { product, cart } = getPages(loggedInPage);

    await product.goToCart();
    const cartDetails = await cart.getCartDetails();

    expect(cartDetails.title).toBe("Your Cart");
    expect(cartDetails.item).toBe(productName);
  });

  test("Should proceed to checkout and fill info", async ({ loggedInPage }) => {
    const { cart, checkout } = getPages(loggedInPage);

    await cart.proceedToCheckout();
    await checkout.fillCheckoutInfo("Zeeaan", "Nawaz", "44000");

    const overview = await checkout.getOverviewDetails();
    expect(overview.title).toBe("Checkout: Overview");
    expect(overview.payment).toBe("Payment Information:");
    expect(overview.shipping).toBe("Shipping Information:");
    expect(overview.total).toBe("Price Total");
  });

  test("Should complete order successfully", async ({ loggedInPage }) => {
    const { checkout } = getPages(loggedInPage);

    await checkout.finishOrder();

    const confirm = await checkout.getOrderCompletionDetails();
    expect(confirm.title).toBe("Checkout: Complete!");
    expect(confirm.message).toBe("Thank you for your order!");
  });
});
