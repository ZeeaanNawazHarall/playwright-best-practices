import { test as base, Page, BrowserContext, expect } from "@playwright/test";
import fs from "fs";
import { appConfig } from "../utils/config";
import { getSessionFile, isSessionExpired } from "../utils/session";

type AuthFixtures = {
  loggedInPage: Page;
};

const workerCache = new Map<number, Page>();

async function performLogin(page: Page) {
  await page.goto(appConfig.url);
  await page.locator('//*[@id="user-name"]').fill(appConfig.getUsername());
  await page.locator('[data-test="password"]').fill(appConfig.getPassword());
  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState("domcontentloaded");

  const titleElement = page.locator('[data-test="title"]');
  await titleElement.waitFor({ state: "visible", timeout: 10000 });

  if (!page.url().includes("inventory.html")) {
    throw new Error("Login successful but not redirected to inventory page");
  }
}

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ browser }, use, testInfo) => {
    testInfo.setTimeout(60000);

    const workerIndex = testInfo.workerIndex;
    if (workerCache.has(workerIndex)) {
      console.log(`[Worker ${workerIndex}] Reusing cached logged-in page`);
      await use(workerCache.get(workerIndex)!);
      return;
    }

    const browserName = testInfo.project.name;
    const sessionFile = getSessionFile(browserName);
    let context: BrowserContext;
    let page: Page;

    const sessionExists = fs.existsSync(sessionFile);

    if (sessionExists && !isSessionExpired(sessionFile)) {
      console.log(`[${browserName}] Using cached session`);
      context = await browser.newContext({ storageState: sessionFile });
      page = await context.newPage();

      try {
        await page.goto(`${appConfig.url}/inventory.html`, {
          waitUntil: "domcontentloaded",
        });
        await page.waitForLoadState("domcontentloaded");

        const titleElement = page.locator('[data-test="title"]');
        const isVisible = await titleElement.isVisible().catch(() => false);

        if (isVisible && !page.url().includes("login")) {
          console.log("Session is valid, proceeding with cached session");
          workerCache.set(workerIndex, page);
          await use(page);
          return;
        }

        console.log("Session exists but appears to be invalid on server");
        await context.close();
      } catch (error) {
        console.log("Error loading session:", error);
        await context.close();
      }
    }

    console.log(`[${browserName}] Performing fresh login`);
    context = await browser.newContext();
    page = await context.newPage();

    await performLogin(page);

    await context.storageState({ path: sessionFile });
    console.log(`[${browserName}] New session saved at:`, sessionFile);

    workerCache.set(workerIndex, page);
    await use(page);
  },
});

export { expect };
