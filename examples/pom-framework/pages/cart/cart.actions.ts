import { CartLocators } from "./cart.locators";
import { Page, expect } from "@playwright/test";

export class CartPage {
  private readonly locators: CartLocators;

  constructor(private page: Page) {
    this.locators = new CartLocators(page);
  }

  async getCartTitle() {
    return await this.locators.cartTitle.innerText();
  }

  async getCartBadgeCount(): Promise<number> {
    const count = await this.locators.cartBadge.count();
    if (count === 0) {
      return 0;
    }
    return Number((await this.locators.cartBadge.innerText()).trim()) || 0;
  }

  async getCartItemCount(): Promise<number> {
    return await this.locators.cartItems.count();
  }

  async getCartItemNames(): Promise<string[]> {
    const names = await this.locators.cartItemNames.allInnerTexts();
    return names.map((name) => name.trim());
  }

  async getCartDetails() {
    return {
      title: await this.getCartTitle(),
      item: (await this.getCartItemNames())[0] ?? "",
    };
  }

  async getCartItemPrices(): Promise<number[]> {
    const rawPrices = await this.locators.cartItemPrices.allInnerTexts();
    return rawPrices.map((price) => Number(price.replace(/[^0-9.]/g, "")));
  }

  async removeItemFromCart(productName: string) {
    const cartItem = this.locators.cartItems.filter({
      has: this.page.locator(
        `[data-test="inventory-item-name"]:has-text("${productName}")`,
      ),
    });

    if ((await cartItem.count()) === 0) {
      throw new Error(`Product not found in cart: ${productName}`);
    }

    const removeButton = cartItem.locator('button[data-test^="remove-"]');

    if ((await removeButton.count()) === 0) {
      throw new Error(`Remove button not found for cart item: ${productName}`);
    }

    await removeButton.click();
    await expect(cartItem).not.toBeVisible();
  }

  async clearCart() {
    while ((await this.getCartItemCount()) > 0) {
      const countBefore = await this.getCartItemCount();
      const removeButton = this.locators.cartItems
        .first()
        .locator('button[data-test^="remove-"]');
      if ((await removeButton.count()) === 0) break;
      await removeButton.click();
      await expect(this.locators.cartItems).toHaveCount(countBefore - 1);
    }
  }

  async proceedToCheckout() {
    await this.locators.checkoutButton.click();
  }

  async continueShopping() {
    await this.locators.continueShoppingButton.click();
  }
}
