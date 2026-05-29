/**
 * Anti-pattern #5: .isVisible() and .textContent() inside expect().
 *
 * Source: https://playwright.dev/docs/best-practices — explicitly called out.
 */

import { Page, expect } from "@playwright/test";

// ❌ .isVisible() resolves immediately — no waiting, no retrying.
//    If the element hasn't rendered yet, this returns false and the test fails.
//    The await is in the wrong position: it awaits the snapshot, not the assertion.
async function checkTitleVisibleBAD(page: Page) {
  expect(await page.getByTestId("title").isVisible()).toBe(true);
}

// ❌ .textContent() resolves immediately — same problem.
//    If the element is still loading, this returns null or stale text.
async function checkTitleTextBAD(page: Page) {
  expect(await page.getByTestId("title").textContent()).toBe("Your Cart");
}

// ✅ Web-first assertions poll up to expect.timeout (default 5 s).
//    The test waits for the condition to become true, not for a single snapshot.
async function checkTitleVisibleGOOD(page: Page) {
  await expect(page.getByTestId("title")).toBeVisible();
}

async function checkTitleTextGOOD(page: Page) {
  await expect(page.getByTestId("title")).toHaveText("Your Cart");
}

// ---------------------------------------------------------------------------
// The same trap appears in fixture code as a session validity check.

async function sessionCheckBAD(page: Page) {
  const titleElement = page.locator('[data-test="title"]');

  // ❌ .isVisible() resolves once. If the page is still loading, this returns
  //    false even though the session is valid. The fixture falls into a
  //    needless fresh-login path.
  const isVisible = await titleElement.isVisible().catch(() => false);
  if (!isVisible) {
    // ... performs a full login unnecessarily
  }
}

async function sessionCheckGOOD(page: Page) {
  // ✅ Try/catch with a web-first assertion. If the title doesn't appear
  //    within 5 s, the session is genuinely invalid.
  try {
    await expect(page.locator('[data-test="title"]')).toHaveText("Products", {
      timeout: 5000,
    });
    // Session is valid — proceed
  } catch {
    // Session is invalid — do a fresh login
  }
}
