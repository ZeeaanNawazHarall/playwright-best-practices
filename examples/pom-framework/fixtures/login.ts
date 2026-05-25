// import { test as base, BrowserContext, Page } from "@playwright/test";
// import fs from "fs";
// import { LoginPage } from "../pages/login/login.actions";
// import { getSessionFile, isSessionExpired } from "../utils/session";
// import { appConfig } from "../utils/config";

// type AuthFixtures = {
//   loggedInPage: Page;
// };

// export const test = base.extend<AuthFixtures>({
//   loggedInPage: async ({ browser }, use, testInfo) => {
//     testInfo.setTimeout(60000); // Set timeout to 60 seconds

//     const browserName = testInfo.project.name;
//     const SESSION_FILE = getSessionFile(browserName);

//     let context: BrowserContext;
//     let page: Page;

//     const sessionExists = fs.existsSync(SESSION_FILE);

//     if (sessionExists && !isSessionExpired(SESSION_FILE)) {
//       console.log(`[${browserName}] Using cached session`);
//       context = await browser.newContext({ storageState: SESSION_FILE });
//       page = await context.newPage();

//       try {
//         await page.goto(`${appConfig.url}/inventory.html`, {
//           waitUntil: "domcontentloaded",
//         });
//         await page.waitForLoadState("domcontentloaded");

//         // Check if session is still valid by looking for the products title
//         const titleElement = page.locator('[data-test="title"]');
//         const isVisible = await titleElement.isVisible().catch(() => false);

//         // If successfully loaded from session
//         if (isVisible && !page.url().includes("login")) {
//           console.log("Session is valid, proceeding with cached session");
//           await use(page);
//           await context.close();
//           return;
//         }

//         console.log("Session exists but appears to be invalid on server");
//         await context.close();
//       } catch (error) {
//         console.log("Error loading session:", error);
//         await context.close();
//       }
//     }

//     // Fresh login
//     console.log(`[${browserName}] Performing fresh login`);
//     context = await browser.newContext();
//     page = await context.newPage();

//     try {
//       const login = new LoginPage(page);
//       await login.gotoLoginPage(appConfig.url);
//       await login.login(appConfig.getUsername(), appConfig.getPassword());

//       // After login, wait for the inventory page to load
//       await page.waitForLoadState("domcontentloaded");

//       // Wait for the products title to appear (indicates successful login)
//       const titleElement = page.locator('[data-test="title"]');
//       await titleElement.waitFor({ state: "visible", timeout: 10000 });
//       await page.waitForLoadState("domcontentloaded");

//       // Verify we're on inventory page
//       if (!page.url().includes("inventory.html")) {
//         throw new Error(
//           "Login successful but not redirected to inventory page",
//         );
//       }

//       // Save session now
//       await context.storageState({ path: SESSION_FILE });
//       console.log(`[${browserName}] New session saved at:`, SESSION_FILE);

//       await use(page);
//     } finally {
//       await context.close();
//     }
//   },
// });

// export { expect } from "@playwright/test";

// fixtures/login.ts
import { test as base, Page, BrowserContext, expect } from "@playwright/test";
import fs from "fs";
import { LoginPage } from "../pages/login/login.actions";
import { getSessionFile, isSessionExpired } from "../utils/session";
import { appConfig } from "../utils/config";

type AuthFixtures = {
  loggedInPage: Page;
};

// ── Per‑worker cache (isolated per worker process) ──────────
const workerCache = new Map<number, Page>();

export const test = base.extend<AuthFixtures>({
  loggedInPage: async ({ browser }, use, testInfo) => {
    testInfo.setTimeout(60000);

    const workerIndex = testInfo.workerIndex; // each worker gets its own index

    // If this worker already has a logged‑in page, reuse it for serial tests
    if (workerCache.has(workerIndex)) {
      console.log(`[Worker ${workerIndex}] Reusing cached logged‑in page`);
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
          workerCache.set(workerIndex, page); // cache for this worker
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

    // Fresh login
    console.log(`[${browserName}] Performing fresh login`);
    context = await browser.newContext();
    page = await context.newPage();

    const login = new LoginPage(page);
    await login.gotoLoginPage(appConfig.url);
    await login.login(appConfig.getUsername(), appConfig.getPassword());
    await page.waitForLoadState("domcontentloaded");

    const titleElement = page.locator('[data-test="title"]');
    await titleElement.waitFor({ state: "visible", timeout: 10000 });
    await page.waitForLoadState("domcontentloaded");

    if (!page.url().includes("inventory.html")) {
      throw new Error("Login successful but not redirected to inventory page");
    }

    await context.storageState({ path: sessionFile });
    console.log(`[${browserName}] New session saved at:`, sessionFile);

    workerCache.set(workerIndex, page); // cache for this worker
    await use(page);
  },
});

export { expect };
