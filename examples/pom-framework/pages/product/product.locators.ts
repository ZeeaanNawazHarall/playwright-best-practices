import { Locator, Page } from "@playwright/test";

export class ProductsLocators {
  readonly cartIcon: Locator;
  readonly cartBadge: Locator;
  readonly openMenuButton: Locator;
  readonly resetAppStateLink: Locator;
  readonly sortDropdown: Locator;
  readonly inventoryItems: Locator;
  readonly inventoryItemNames: Locator;
  readonly inventoryItemPrices: Locator;

  constructor(page: Page) {
    this.cartIcon = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.openMenuButton = page.locator('[data-test="open-menu"]');
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.inventoryItems = page.locator('[data-test="inventory-item"]');
    this.inventoryItemNames = page.locator('[data-test="inventory-item-name"]');
    this.inventoryItemPrices = page.locator(
      '[data-test="inventory-item-price"]',
    );
  }
}
