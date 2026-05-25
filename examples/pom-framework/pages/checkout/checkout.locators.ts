import { Locator, Page } from "@playwright/test";

export class CheckoutLocators {
  readonly fName: Locator;
  readonly lName: Locator;
  readonly zip: Locator;
  readonly continueButton: Locator;
  readonly overviewTitle: Locator;
  readonly paymentInfo: Locator;
  readonly shippingInfo: Locator;
  readonly totalPayInfo: Locator;
  readonly summarySubtotalLabel: Locator;
  readonly summaryTaxLabel: Locator;
  readonly summaryTotalLabel: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly checkoutTitle: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.fName = page.locator('[data-test="firstName"]');
    this.lName = page.locator('[data-test="lastName"]');
    this.zip = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');

    this.overviewTitle = page.locator('[data-test="title"]');
    this.paymentInfo = page.locator('[data-test="payment-info-label"]');
    this.shippingInfo = page.locator('[data-test="shipping-info-label"]');
    this.totalPayInfo = page.locator('[data-test="total-info-label"]');
    this.summarySubtotalLabel = page.locator('[data-test="subtotal-label"]');
    this.summaryTaxLabel = page.locator('[data-test="tax-label"]');
    this.summaryTotalLabel = page.locator('[data-test="total-label"]');
    this.cancelButton = page.locator('[data-test="cancel"]');

    this.finishButton = page.locator('[data-test="finish"]');
    this.checkoutTitle = page.locator('[data-test="title"]');
    this.successMessage = page.locator('[data-test="complete-header"]');
  }
}
