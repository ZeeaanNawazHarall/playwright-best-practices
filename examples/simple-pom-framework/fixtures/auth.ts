import { test as base, Page, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { appConfig } from "../utils/config";

type WorkerFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<{}, WorkerFixtures>({
  loggedInPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();

      const login = new LoginPage(page);
      await login.goto(appConfig.url);
      await login.login(appConfig.getUsername(), appConfig.getPassword());

      await expect(page.locator('[data-test="title"]')).toHaveText("Products");

      await use(page);

      await context.close();
    },
    { scope: "worker" },
  ],
});

export { expect };
