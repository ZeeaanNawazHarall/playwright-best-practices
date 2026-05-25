import { CheckoutLocators } from "./checkout.locators";
import { Page } from "@playwright/test";

export class CheckoutPage {
  private readonly locators: CheckoutLocators;

  constructor(private readonly page: Page) {
    this.locators = new CheckoutLocators(page);
  }

  async fillCheckoutInfo(firstName: string, lastName: string, zip: string) {
    await this.locators.fName.fill(firstName);
    await this.locators.lName.fill(lastName);
    await this.locators.zip.fill(zip);
    await this.locators.continueButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async getOverviewDetails() {
    return {
      title: await this.locators.overviewTitle.innerText(),
      payment: await this.locators.paymentInfo.innerText(),
      shipping: await this.locators.shippingInfo.innerText(),
      total: await this.locators.totalPayInfo.innerText(),
    };
  }

  async getSummaryTotals() {
    return {
      itemTotal: await this.locators.summarySubtotalLabel.innerText(),
      tax: await this.locators.summaryTaxLabel.innerText(),
      total: await this.locators.summaryTotalLabel.innerText(),
    };
  }

  async cancelCheckout() {
    await this.locators.cancelButton.click();
    await this.page.waitForLoadState("domcontentloaded");
  }

  async finishOrder() {
    await this.locators.finishButton.click();
  }

  async getOrderCompletionDetails() {
    return {
      title: await this.locators.checkoutTitle.innerText(),
      message: await this.locators.successMessage.innerText(),
    };
  }
}
