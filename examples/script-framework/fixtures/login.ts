import { test as base, Page, expect } from "@playwright/test";
import fs from "fs";
import { appConfig } from "../utils/config";
import { getSessionFile, isSessionExpired } from "../utils/session";

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
          await performLogin(page);
          await context.storageState({ path: sessionFile });
        }
      } else {
        await performLogin(page);
        await context.storageState({ path: sessionFile });
      }

      await use(page);

      await context.close();
    },
    { scope: "worker" },
  ],
});

async function performLogin(page: Page): Promise<void> {
  await page.goto(appConfig.url);
  await page.getByTestId("username").fill(appConfig.getUsername());
  await page.getByTestId("password").fill(appConfig.getPassword());
  await page.getByTestId("login-button").click();
  await expect(page.locator('[data-test="title"]')).toBeVisible();
}

export { expect };
