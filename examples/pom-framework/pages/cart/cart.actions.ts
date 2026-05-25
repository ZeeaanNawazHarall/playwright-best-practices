import { CartLocators } from "./cart.locators";
import { Page } from "@playwright/test";

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
    // Find the product name element directly
    const productNameElement = this.page.locator(
      `[data-test="inventory-item-name"]:has-text("${productName}")`,
    );

    if ((await productNameElement.count()) === 0) {
      throw new Error(`Product not found in cart: ${productName}`);
    }

    // Navigate up to the parent cart_item div
    const cartItem = productNameElement.locator(
      "xpath=ancestor::div[contains(@class, 'cart_item')]",
    );

    // Find the remove button within this cart item
    const removeButton = cartItem.locator('button[data-test^="remove-"]');

    if ((await removeButton.count()) === 0) {
      throw new Error(`Remove button not found for cart item: ${productName}`);
    }

    await removeButton.click();
    await this.page.waitForTimeout(300);
    await cartItem.waitFor({ state: "hidden", timeout: 5000 }).catch(() => {});
  }

  async clearCart() {
    while ((await this.getCartItemCount()) > 0) {
      const removeButton = this.page
        .locator(
          '.cart_item[data-test="inventory-item"] button[data-test^="remove-"]',
        )
        .first();
      if ((await removeButton.count()) === 0) {
        break;
      }
      await removeButton.click();
      await this.page.waitForTimeout(300);
    }
  }

  async proceedToCheckout() {
    await this.locators.checkoutButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async continueShopping() {
    await this.locators.continueShoppingButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }
}
