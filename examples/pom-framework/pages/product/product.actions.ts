import { Locator, Page, expect } from "@playwright/test";
import { ProductsLocators } from "./product.locators";

export class ProductsPage {
  private readonly locators: ProductsLocators;

  constructor(private page: Page) {
    this.locators = new ProductsLocators(page);
  }

  private getProductByName(productName: string): Locator {
    return this.locators.inventoryItems.filter({
      has: this.page.locator(
        `[data-test="inventory-item-name"]:has-text("${productName}")`,
      ),
    });
  }

  private normalizeText(text: string): string {
    return text.trim();
  }

  private parsePrice(priceText: string): number {
    return Number(priceText.replace(/[^0-9.]/g, ""));
  }

  async getCartBadgeCount(): Promise<number> {
    if ((await this.locators.cartBadge.count()) === 0) {
      return 0;
    }
    const text = await this.locators.cartBadge.innerText();
    return Number(text.trim()) || 0;
  }

  async resetAppState() {
    if ((await this.locators.openMenuButton.count()) === 0) {
      return;
    }
    await this.locators.openMenuButton.click();
    await this.locators.resetAppStateLink.click();
  }

  async sortProductsBy(sortOption: "az" | "za" | "lohi" | "hilo") {
    await this.locators.sortDropdown.selectOption(sortOption);
  }

  async getVisibleProductNames(): Promise<string[]> {
    await expect(this.locators.inventoryItems.first()).toBeVisible();
    const names = await this.locators.inventoryItemNames.allInnerTexts();
    return names.map((name) => this.normalizeText(name));
  }

  async getVisibleProductPrices(): Promise<number[]> {
    await expect(this.locators.inventoryItems.first()).toBeVisible();
    const prices = await this.locators.inventoryItemPrices.allInnerTexts();
    return prices.map((price) => this.parsePrice(this.normalizeText(price)));
  }

  async addItemToCart(productName: string) {
    const productItem = this.getProductByName(productName);
    await expect(productItem).toBeVisible();

    const addButton = productItem
      .locator('button[data-test^="add-to-cart-"]')
      .first();

    if ((await addButton.count()) === 0) {
      throw new Error(`Add button not found for product: ${productName}`);
    }

    await addButton.click();
  }

  async addItemsToCart(productNames: string[]) {
    for (const name of productNames) {
      await this.addItemToCart(name);
    }
  }

  async goToCart() {
    await this.locators.cartIcon.click();
  }

  async sortAddAndVerify(
    sortOption: "az" | "za" | "lohi" | "hilo",
    itemsToAdd: string[],
    expectedBadgeCount: number,
  ) {
    await this.sortProductsBy(sortOption);

    for (const item of itemsToAdd) {
      await this.addItemToCart(item);
    }

    await expect(this.locators.cartBadge).toHaveText(`${expectedBadgeCount}`);
  }
}
