import { expect, test } from "../../fixtures/login";
import { CartPage } from "../../pages/cart/cart.actions";
import { LoginPage } from "../../pages/login/login.actions";
import { ProductsPage } from "../../pages/product/product.actions";

test("Scenario 1: Login with Valid Credentials", async ({ loggedInPage }) => {
  const page = loggedInPage;
  const login = new LoginPage(page);

  // Session state is automatically managed by the fixture
  // Verify login was successful
  await login.isLoggedIn();
});

test("Quick smoke test (non-POM)", async ({ loggedInPage }) => {
  await loggedInPage.locator('[data-test="shopping-cart-link"]').click();
  await expect(loggedInPage.locator('[data-test="title"]')).toContainText(
    "Your Cart",
  );
});

test("Complex method: sort, add multiple, verify", async ({ loggedInPage }) => {
  const product = new ProductsPage(loggedInPage);
  const cart = new CartPage(loggedInPage);

  await product.sortAddAndVerify(
    "lohi",
    ["Sauce Labs Backpack", "Sauce Labs Bike Light"],
    2,
  );

  // Verify on cart page
  await product.goToCart();
  const cartDetails = await cart.getCartDetails();

  expect(cartDetails.title).toBe("Your Cart");
  const cartItemNames = await cart.getCartItemNames();
  expect(cartItemNames.length).toBe(2);
  expect(cartItemNames).toEqual(
    expect.arrayContaining(["Sauce Labs Backpack", "Sauce Labs Bike Light"]),
  );
});
