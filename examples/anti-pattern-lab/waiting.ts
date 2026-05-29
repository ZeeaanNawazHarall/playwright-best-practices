/**
 * Anti-patterns #3, #4, and #9: waitForTimeout, waitForSelector,
 * and redundant waitForLoadState calls.
 *
 * Source: https://playwright.dev/docs/best-practices
 */

import { Page, expect } from "@playwright/test";

// ---------------------------------------------------------------------------
// #3 — waitForTimeout

// ❌ Hard wait assumes the DOM update always takes less than 200 ms.
//    On a slow CI runner it may take 800 ms — the assertion that follows
//    then reads a stale value. And on a fast machine the 200 ms is wasted.
async function addItemToCartBAD(page: Page, productName: string) {
  const addButton = page
    .locator('[data-test="inventory-item"]')
    .filter({ hasText: productName })
    .locator('button[data-test^="add-to-cart-"]');

  await addButton.click();
  await page.waitForTimeout(200); // ← remove this
}

// ✅ The caller asserts the outcome. Web-first assertions poll automatically.
//    The test passes the instant the badge updates, and fails if it never does.
async function addItemToCartGOOD(page: Page, productName: string) {
  const addButton = page
    .locator('[data-test="inventory-item"]')
    .filter({ hasText: productName })
    .locator('button[data-test^="add-to-cart-"]');

  await addButton.click();
  // No wait here. The caller asserts: await expect(badge).toHaveText('1');
}

// ---------------------------------------------------------------------------
// #4 — waitForSelector

// ❌ waitForSelector resolves on a single DOM presence check.
//    The locator operations that follow get no further retry protection.
async function getVisibleProductNamesBAD(page: Page): Promise<string[]> {
  await page.waitForSelector('[data-test="inventory-item"]');
  return page.locator('[data-test="inventory-item-name"]').allInnerTexts();
}

// ✅ Web-first assertion uses Playwright's full polling engine.
//    If the element disappears between the check and allInnerTexts(), the
//    locator retries automatically.
async function getVisibleProductNamesGOOD(page: Page): Promise<string[]> {
  await expect(page.locator('[data-test="inventory-item"]').first()).toBeVisible();
  return page.locator('[data-test="inventory-item-name"]').allInnerTexts();
}

// ---------------------------------------------------------------------------
// #9 — Redundant waitForLoadState

// ❌ Three waits for one navigation. goto() with waitUntil already waited.
//    click() auto-waits. The final expect() does all the work anyway.
async function loginAndVerifyBAD(page: Page, url: string) {
  await page.goto(`${url}/inventory.html`, { waitUntil: "domcontentloaded" });
  await page.waitForLoadState("domcontentloaded"); // duplicate — goto already waited

  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState("domcontentloaded"); // redundant — click auto-waits

  const title = page.locator('[data-test="title"]');
  await title.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForLoadState("domcontentloaded"); // redundant after waitFor
}

// ✅ One assertion does the work of all three waits above.
async function loginAndVerifyGOOD(page: Page, url: string) {
  await page.goto(`${url}/inventory.html`);
  await page.locator('[data-test="login-button"]').click();
  await expect(page.locator('[data-test="title"]')).toBeVisible();
}
