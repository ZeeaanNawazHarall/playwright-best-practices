import { test as base, Page, expect } from "@playwright/test";
import fs from "fs";
import { LoginPage } from "../pages/login/login.actions";
import { getSessionFile, isSessionExpired } from "../utils/session";
import { appConfig } from "../utils/config";

type WorkerFixtures = {
  loggedInPage: Page;
};

export const test = base.extend<{}, WorkerFixtures>({
  loggedInPage: [
    async ({ browser }, use, workerInfo) => {
      const browserName = workerInfo.project.name;
      const sessionFile = getSessionFile(browserName);
      const hasValidSession =
        fs.existsSync(sessionFile) && !isSessionExpired(sessionFile);

      let context = await browser.newContext(
        hasValidSession ? { storageState: sessionFile } : {},
      );
      let page = await context.newPage();

      if (hasValidSession) {
        await page.goto(`${appConfig.url}/inventory.html`);

        let sessionAlive = false;
        try {
          await expect(page.locator('[data-test="title"]')).toHaveText(
            "Products",
            { timeout: 5000 },
          );
          sessionAlive = !page.url().includes("login");
        } catch {
          sessionAlive = false;
        }

        if (!sessionAlive) {
          await context.close();
          context = await browser.newContext();
          page = await context.newPage();
          await doLogin(page);
          await context.storageState({ path: sessionFile });
        }
      } else {
        await doLogin(page);
        await context.storageState({ path: sessionFile });
      }

      await use(page);

      await context.close();
    },
    { scope: "worker" },
  ],
});

async function doLogin(page: Page): Promise<void> {
  const login = new LoginPage(page);
  await login.gotoLoginPage(appConfig.url);
  await login.login(appConfig.getUsername(), appConfig.getPassword());
  await expect(page.locator('[data-test="title"]')).toBeVisible();
}

export { expect };
