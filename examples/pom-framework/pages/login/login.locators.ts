import { Locator, Page } from "@playwright/test";

export class LoginLocators {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;
  readonly productPage: Locator;

  constructor(page: Page) {
    this.usernameField = page.locator('//*[@id="user-name"]');
    this.passwordField = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.productPage = page.locator('[data-test="title"]');
  }
}
