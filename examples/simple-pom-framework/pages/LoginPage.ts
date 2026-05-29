import { Locator, Page, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId("username");
    this.passwordInput = page.getByTestId("password");
    this.loginButton = page.getByTestId("login-button");
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await expect(this.page.locator('[data-test="title"]')).toBeVisible();
  }
}
