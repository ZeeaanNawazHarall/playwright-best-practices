import { Locator, Page } from "@playwright/test";

export class CheckoutPage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly postalCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;
  private readonly itemTotalLabel: Locator;
  private readonly confirmationHeader: Locator;

  constructor(page: Page) {
    this.firstNameInput = page.getByTestId("firstName");
    this.lastNameInput = page.getByTestId("lastName");
    this.postalCodeInput = page.getByTestId("postalCode");
    this.continueButton = page.getByTestId("continue");
    this.finishButton = page.getByTestId("finish");
    this.cancelButton = page.getByTestId("cancel");
    this.itemTotalLabel = page.getByTestId("subtotal-label");
    this.confirmationHeader = page.getByTestId("complete-header");
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
    await this.continueButton.click();
  }

  async finish() {
    await this.finishButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
  }

  async getItemTotal(): Promise<string> {
    return this.itemTotalLabel.innerText();
  }

  async getConfirmationMessage(): Promise<string> {
    return this.confirmationHeader.innerText();
  }
}
