import { Locator, Page, expect } from "@playwright/test";

export class InventoryPage {
  readonly page: Page;
  private readonly sortDropdown: Locator;
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly inventoryItems: Locator;
  private readonly menuButton: Locator;
  private readonly resetLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sortDropdown = page.getByTestId("product-sort-container");
    this.cartBadge = page.getByTestId("shopping-cart-badge");
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.inventoryItems = page.getByTestId("inventory-item");
    this.menuButton = page.getByTestId("open-menu");
    this.resetLink = page.getByTestId("reset-sidebar-link");
  }

  async sortBy(option: "az" | "za" | "lohi" | "hilo") {
    await this.sortDropdown.selectOption(option);
  }

  async getProductNames(): Promise<string[]> {
    await expect(this.inventoryItems.first()).toBeVisible();
    return this.page.getByTestId("inventory-item-name").allInnerTexts();
  }

  async addToCart(productName: string) {
    const product = this.inventoryItems.filter({ hasText: productName });
    await product.locator('button[data-test^="add-to-cart-"]').click();
  }

  async getCartCount(): Promise<number> {
    if ((await this.cartBadge.count()) === 0) return 0;
    return Number(await this.cartBadge.innerText()) || 0;
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async resetAppState() {
    if ((await this.menuButton.count()) === 0) return;
    await this.menuButton.click();
    await this.resetLink.click();
  }
}
