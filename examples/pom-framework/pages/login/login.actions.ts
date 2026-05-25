import { expect, Page } from "@playwright/test";
import { LoginLocators } from "./login.locators";

export class LoginPage {
  private readonly locators: LoginLocators;

  constructor(private page: Page) {
    this.locators = new LoginLocators(page);
  }

  async gotoLoginPage(url: string) {
    await this.page.goto(url);
  }

  async login(username: string, password: string) {
    await this.locators.usernameField.fill(username);
    await this.locators.passwordField.fill(password);
    await this.locators.loginButton.click();
  }

  async isLoggedIn() {
    await expect(this.locators.productPage).toContainText("Products");
  }
}
