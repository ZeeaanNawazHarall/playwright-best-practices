/**
 * Anti-pattern #12: test.describe.serial without a real dependency.
 *
 * Source: https://playwright.dev/docs/best-practices
 * "Only use serial if tests depend on each other."
 */

import { test } from "@playwright/test";

// ---------------------------------------------------------------------------
// ❌ serial used as a default — prevents parallel execution even for tests
//    that start from a fresh fixture and share no state.
//    With fullyParallel: true, this block becomes a bottleneck.
//    All three tests queue behind each other even though they could run
//    simultaneously in separate workers.

/*
test.describe.serial('Product page', () => {
  test('should display products', async ({ page }) => {
    // independent — starts from scratch
  });
  test('should sort products', async ({ page }) => {
    // independent — starts from scratch
  });
  test('should add item to cart', async ({ page }) => {
    // independent — starts from scratch
  });
});
*/

// ✅ Without serial, Playwright runs each test in its own worker in parallel.
//    Runtime for three 10-second tests drops from 30 s to ~10 s.
test.describe("Product page", () => {
  test("should display products", async ({ page }) => {
    // independent
    void page;
  });
  test("should sort products", async ({ page }) => {
    // independent
    void page;
  });
  test("should add item to cart", async ({ page }) => {
    // independent
    void page;
  });
});

// ---------------------------------------------------------------------------
// ✅ serial IS correct when tests genuinely chain browser state.
//    Test 2 can only run if test 1 has already added an item to the cart.
//    That shared state is the dependency that justifies serial.

test.describe.serial("Checkout flow", () => {
  test("should add item to cart", async ({ page }) => {
    // adds an item — mutates state
    void page;
  });
  test("should view cart", async ({ page }) => {
    // reads the item added above — depends on test 1
    void page;
  });
  test("should complete checkout", async ({ page }) => {
    // completes the order — depends on tests 1 and 2
    void page;
  });
});
