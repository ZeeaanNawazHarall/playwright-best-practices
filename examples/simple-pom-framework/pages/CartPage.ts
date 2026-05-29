import { Locator, Page, expect } from "@playwright/test";

export class CartPage {
  private readonly title: Locator;
  private readonly cartItems: Locator;
  private readonly checkoutButton: Locator;
  private readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId("title");
    this.cartItems = page.getByTestId("inventory-item");
    this.checkoutButton = page.getByTestId("checkout");
    this.continueShoppingButton = page.getByTestId("continue-shopping");
  }

  async getTitle(): Promise<string> {
    return this.title.innerText();
  }

  async getItemNames(): Promise<string[]> {
    return this.cartItems.getByTestId("inventory-item-name").allInnerTexts();
  }

  async getItemCount(): Promise<number> {
    return this.cartItems.count();
  }

  async removeItem(productName: string) {
    const item = this.cartItems.filter({ hasText: productName });
    await item.locator('button[data-test^="remove-"]').click();
    await expect(item).not.toBeVisible();
  }

  async clearCart() {
    while ((await this.cartItems.count()) > 0) {
      const countBefore = await this.cartItems.count();
      await this.cartItems
        .first()
        .locator('button[data-test^="remove-"]')
        .click();
      await expect(this.cartItems).toHaveCount(countBefore - 1);
    }
  }

  async proceedToCheckout() {
    await this.checkoutButton.click();
  }

  async continueShopping() {
    await this.continueShoppingButton.click();
  }
}
