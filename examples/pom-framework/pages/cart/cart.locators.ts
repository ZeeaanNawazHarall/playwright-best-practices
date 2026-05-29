import { Locator, Page } from "@playwright/test";

export class CartLocators {
  readonly cartTitle: Locator;
  readonly cartBadge: Locator;
  readonly cartItems: Locator;
  readonly cartItemNames: Locator;
  readonly cartItemPrices: Locator;
  readonly continueShoppingButton: Locator;
  readonly checkoutButton: Locator;

  constructor(page: Page) {
    this.cartTitle = page.locator('[data-test="title"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.cartItems = page.locator('[data-test="inventory-item"]');
    this.cartItemNames = page.locator(
      '[data-test="inventory-item"] [data-test="inventory-item-name"]',
    );
    this.cartItemPrices = page.locator(
      '[data-test="inventory-item"] [data-test="inventory-item-price"]',
    );
    this.continueShoppingButton = page.locator(
      '[data-test="continue-shopping"]',
    );
    this.checkoutButton = page.locator('[data-test="checkout"]');
  }
}
