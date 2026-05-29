/**
 * Anti-patterns #8 and #11: no teardown after await use(), and
 * console.log statements in fixture code.
 *
 * Source: https://playwright.dev/docs/best-practices (anti-pattern #11)
 */

import { test as base, Page, BrowserContext } from "@playwright/test";

type AuthFixtures = { loggedInPage: Page };

const workerCache = new Map<number, Page>();

// ---------------------------------------------------------------------------
// #8 — No teardown after await use()

// ❌ The context for each worker is left open until the OS reclaims the
//    process. For long-running CI jobs or suites with many workers this
//    leaks memory and browser processes.
export const testBad = base.extend<AuthFixtures>({
  loggedInPage: async ({ browser }, use, testInfo) => {
    const workerIndex = testInfo.workerIndex;

    if (workerCache.has(workerIndex)) {
      await use(workerCache.get(workerIndex)!);
      return; // ← no teardown: context stays open
    }

    const context: BrowserContext = await browser.newContext();
    const page: Page = await context.newPage();
    // ... login ...
    workerCache.set(workerIndex, page);

    await use(page);
    // ← no context.close() here: resource leak
  },
});

// ✅ With { scope: 'worker' }, the fixture runs once per worker.
//    context.close() after use() runs exactly once when all tests in the
//    worker finish — clean teardown, no leaks.
export const testGood = base.extend<AuthFixtures>({
  loggedInPage: [
    async ({ browser }, use) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      // ... login ...

      await use(page);

      await context.close(); // ← runs when the worker finishes all its tests
    },
    { scope: "worker" },
  ],
});

// ---------------------------------------------------------------------------
// #11 — console.log in fixture

// ❌ These logs appear in CI output for every test that uses the fixture.
//    They are noise that makes real failures harder to find, and they add
//    I/O overhead in parallel runs.

/*
export const testWithLogs = base.extend<AuthFixtures>({
  loggedInPage: async ({ browser }, use, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    if (workerCache.has(workerIndex)) {
      console.log(`[Worker ${workerIndex}] Reusing cached logged-in page`);
      await use(workerCache.get(workerIndex)!);
      return;
    }
    console.log(`[chromium] Performing fresh login`);
    // ...
    console.log(`[chromium] New session saved at:`, sessionFile);
    await use(page);
  },
});
*/

// ✅ test.step() is visible in the HTML report and Trace Viewer — structured,
//    not polluting stdout. Remove diagnostic logs entirely in production code.
