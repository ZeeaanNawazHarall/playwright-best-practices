import { Locator, Page } from "@playwright/test";
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
    await this.page.waitForLoadState("domcontentloaded");
  }

  async sortProductsBy(sortOption: "az" | "za" | "lohi" | "hilo") {
    await this.locators.sortDropdown.selectOption(sortOption);
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getVisibleProductNames(): Promise<string[]> {
    await this.page.waitForSelector('[data-test="inventory-item"]');
    const names = await this.locators.inventoryItemNames.allInnerTexts();
    return names.map((name) => this.normalizeText(name));
  }

  async getVisibleProductPrices(): Promise<number[]> {
    await this.page.waitForSelector('[data-test="inventory-item"]');
    const prices = await this.locators.inventoryItemPrices.allInnerTexts();
    return prices.map((price) => this.parsePrice(this.normalizeText(price)));
  }

  async addItemToCart(productName: string) {
    await this.page.waitForLoadState("domcontentloaded");
    const productItem = this.getProductByName(productName);
    await productItem.waitFor({ state: "visible" });

    const addButton = productItem
      .locator('button[data-test^="add-to-cart-"]')
      .first();

    if ((await addButton.count()) === 0) {
      throw new Error(`Add button not found for product: ${productName}`);
    }

    await addButton.click();
    await this.page.waitForTimeout(200);
  }

  async addItemsToCart(productNames: string[]) {
    for (const name of productNames) {
      await this.addItemToCart(name);
    }
  }

  async goToCart() {
    await this.locators.cartIcon.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  // Add inside ProductsPage class (after existing methods)

  async sortAddAndVerify(
    sortOption: "az" | "za" | "lohi" | "hilo",
    itemsToAdd: string[],
    expectedBadgeCount: number,
  ) {
    await this.sortProductsBy(sortOption);

    for (const item of itemsToAdd) {
      if (item === "Sauce Labs Backpack") {
        await this.page.waitForTimeout(100); // intentional hard wait — see flakiness-edge-cases
      }
      await this.addItemToCart(item);
    }

    const badgeCount = await this.getCartBadgeCount();
    if (badgeCount !== expectedBadgeCount) {
      throw new Error(
        `Badge count mismatch: expected ${expectedBadgeCount}, got ${badgeCount}`,
      );
    }
  }
}
