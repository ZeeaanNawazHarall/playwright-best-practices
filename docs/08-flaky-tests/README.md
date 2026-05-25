# Flaky Tests

> **Source**: Auto-waiting and actionability checks are documented at [playwright.dev/docs/actionability](https://playwright.dev/docs/actionability). Retries at [playwright.dev/docs/test-retries](https://playwright.dev/docs/test-retries). Testing philosophy and web-first assertions at [playwright.dev/docs/best-practices](https://playwright.dev/docs/best-practices). Network mocking at [playwright.dev/docs/network](https://playwright.dev/docs/network). Where something goes beyond official documentation, it is labeled as a **note**.

---

## Flaky vs Consistently Failing

From the [official docs](https://playwright.dev/docs/test-retries):

Playwright classifies test outcomes as:
- **passed** — succeeds on first run
- **flaky** — fails on first run but passes on retry
- **failed** — fails on first run and all retries

A consistently failing test has a bug — either in the test or in the application. A flaky test has a timing, isolation, or environment problem. The fix is different for each.

Retries mask flakiness rather than fixing it. If a test is marked flaky after enabling retries, treat it as a signal to investigate the root cause rather than accepting the retry as the solution.

---

## What Playwright Already Does For You

Before diagnosing flakiness, understand what Playwright handles automatically via **auto-waiting**.

From the [official actionability docs](https://playwright.dev/docs/actionability):

> "Playwright performs a range of actionability checks on the elements before making actions to ensure these actions behave as expected."

Before executing an action on a locator, Playwright waits for the element to pass a set of checks:

| Check | Meaning |
|-------|---------|
| **Visible** | Element has a non-empty bounding box and is not `visibility:hidden` |
| **Stable** | Element's bounding box has not changed across two consecutive animation frames |
| **Receives events** | Element is the hit target at the action point — no overlay is intercepting |
| **Enabled** | Element does not have the `[disabled]` attribute or `[aria-disabled=true]` |
| **Editable** | Element is enabled and not `[readonly]` |

Which checks apply per action:

| Action | Checks performed |
|--------|-----------------|
| `click()`, `check()`, `tap()` | Visible, stable, receives events, enabled |
| `hover()`, `dragTo()` | Visible, stable, receives events |
| `fill()`, `type()` | Visible, enabled, editable |
| `screenshot()` | Visible, stable |
| `focus()`, `press()`, `dispatchEvent()` | None — bypasses checks |

This means `await page.getByRole('button', { name: 'Submit' }).click()` already waits for the button to be visible, stable, and enabled before clicking. You do not need a separate `waitForSelector` or `waitForTimeout` before it.

---

## Cause 1 — Hard Waits (`waitForTimeout`)

The most common cause of both flakiness and slow suites.

From the [official best practices](https://playwright.dev/docs/best-practices):

```typescript
// Wrong — waits a fixed 5 seconds regardless of page state
await page.waitForTimeout(5000);
await page.getByRole('button', { name: 'Submit' }).click();
```

```typescript
// Correct — waits only until the button is ready, up to the configured timeout
await page.getByRole('button', { name: 'Submit' }).click();
```

`waitForTimeout` is flaky by nature:
- If the page takes longer than the hardcoded delay on a slow CI runner, the next action fails
- If the page loads faster locally, the delay passes silently but adds seconds to every test run

### When `waitForTimeout` appears to be necessary

If you find yourself reaching for `waitForTimeout`, it usually means one of:

1. **An animation is playing** — use `expect(locator).toBeVisible()` instead, which waits for stable state
2. **A network request hasn't completed** — wait for the response or the resulting UI change
3. **A polling operation** — use `expect.poll()` (see below)
4. **A toast or notification needs to disappear** — wait for it to detach: `await expect(locator).toBeHidden()`

The only legitimate use of `waitForTimeout` is intentional delays in test code for demonstration or research purposes — never in production test suites.

---

## Cause 2 — Wrong `await` Placement (The `.isVisible()` Trap)

From the [official best practices](https://playwright.dev/docs/best-practices), this is one of the most important distinctions in Playwright:

```typescript
// Flaky — resolves immediately, no waiting at all
expect(await page.getByText('Welcome').isVisible()).toBe(true);
```

```typescript
// Correct — waits up to expect.timeout for the condition to become true
await expect(page.getByText('Welcome')).toBeVisible();
```

The difference: `.isVisible()` is a method call that returns a `Promise<boolean>` immediately — it checks the DOM at the instant it is called and returns the result. If the element has not rendered yet, it returns `false` and the assertion fails.

`expect(locator).toBeVisible()` is a **web-first assertion** — it polls the locator until the condition is true or the timeout expires.

The `await` belongs on the `expect`, not on the locator method.

| Assertion style | Waits? | Use this |
|----------------|--------|----------|
| `expect(await locator.isVisible()).toBe(true)` | No | Never |
| `expect(await locator.textContent()).toBe('x')` | No | Never |
| `await expect(locator).toBeVisible()` | Yes | Always |
| `await expect(locator).toHaveText('x')` | Yes | Always |

---

## Cause 3 — Tests That Share State

From the [official best practices](https://playwright.dev/docs/best-practices):

> "Each test should be completely isolated from another test and should run independently with its own local storage, session storage, data, cookies etc."

Tests fail unpredictably when they depend on the side effects of a previous test — leftover cart items, a user account left in a modified state, a database record created by another test.

### Signs of shared state flakiness

- Tests pass when run alone (`npx playwright test checkout.spec.ts`) but fail when run as part of the full suite
- Tests pass in one order but fail in another
- Tests only fail on parallel runs, not when `workers: 1`

### Patterns that introduce shared state

```typescript
// Dangerous — a module-level variable shared across tests in a file
let productPage: ProductsPage;

test.beforeAll(async ({ loggedInPage }) => {
  productPage = new ProductsPage(loggedInPage); // one instance for all tests
});

test('adds item', async () => {
  await productPage.addItemToCart('Bike Light'); // modifies page state
});

test('checks badge', async () => {
  // depends on the item added by the previous test — fails if run independently
  expect(await productPage.getCartBadgeCount()).toBe(1);
});
```

```typescript
// Safe — each test creates its own page object from its own loggedInPage
test('adds item and checks badge', async ({ loggedInPage }) => {
  const product = new ProductsPage(loggedInPage);
  await product.addItemToCart('Bike Light');
  expect(await product.getCartBadgeCount()).toBe(1);
});
```

### When shared state is intentional: `test.describe.serial`

Sometimes tests genuinely form a chain — add to cart, view cart, checkout. For these, use `test.describe.serial`:

```typescript
test.describe.serial('Checkout flow', () => {
  test('adds item to cart', async ({ loggedInPage }) => { /* ... */ });
  test('views cart', async ({ loggedInPage }) => { /* ... */ });
  test('completes checkout', async ({ loggedInPage }) => { /* ... */ });
});
```

From the [official docs](https://playwright.dev/docs/test-retries): in serial mode with retries enabled, "all tests are retried together" when one fails. Without retries, subsequent tests in the block are skipped after a failure.

Use `serial` deliberately, not as a workaround for poorly isolated tests.

---

## Cause 4 — Race Conditions (Network and Rendering)

Race conditions happen when a test acts on the UI before an async operation — an API call, a state update, an animation — has completed.

### Waiting for navigation

```typescript
// Flaky — clicks then immediately tries to read the new page before it loads
await page.getByRole('button', { name: 'Checkout' }).click();
await expect(page.getByTestId('title')).toHaveText('Checkout: Overview');
// ↑ this already handles the wait — toHaveText polls until true
```

`click()` returns after the click action completes, not after any navigation finishes. If the next action is an `expect` assertion (web-first), Playwright will wait for the condition automatically. The race condition arises when you use a non-waiting check immediately after navigation:

```typescript
// Flaky
await page.getByRole('button', { name: 'Checkout' }).click();
const url = page.url(); // resolves immediately — may still be the old URL
expect(url).toContain('checkout');
```

```typescript
// Correct
await page.getByRole('button', { name: 'Checkout' }).click();
await page.waitForURL('**/checkout**');
// or simply:
await expect(page).toHaveURL(/checkout/);
```

### Waiting for network

When an action triggers an API call and the UI updates after the response, wait for the response — not for a fixed time.

```typescript
// Wait for a specific request to complete
const responsePromise = page.waitForResponse('**/api/cart');
await page.getByRole('button', { name: 'Add to cart' }).click();
await responsePromise;
await expect(page.getByTestId('cart-badge')).toHaveText('1');
```

### Waiting for animations

`click()` already checks that an element is **stable** (bounding box unchanged across two animation frames) before acting. However, if you are asserting visual state after an animation, use `expect(locator).toBeVisible()` or `expect(locator).toHaveCSS(...)` — both poll until the condition is met.

---

## Cause 5 — Missing Assertions

A test with no `expect()` call always passes — even when the application is broken. This is a correctness problem that can look like a flakiness problem when the test later acquires an assertion that depends on unverified state.

```typescript
// Passes even if login failed
test('logs in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('pass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  // no assertion — you have no idea if login succeeded
});
```

```typescript
// Correct — asserts the outcome
test('logs in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('user');
  await page.getByLabel('Password').fill('pass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

---

## Cause 6 — External and Third-Party Dependencies

From the [official best practices](https://playwright.dev/docs/best-practices):

> "Don't try to test links to external sites or third party servers that you do not control."

External services introduce flakiness that is entirely outside your control — rate limits, downtime, slow responses, changed responses.

Use `page.route()` to mock external API calls:

```typescript
// Mock a third-party analytics call that should not affect test outcome
await page.route('**/api.analytics.example.com/**', route =>
  route.fulfill({ status: 200, body: '{}' })
);

// Mock an external payment status API
await page.route('**/payment-provider.example.com/status', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ status: 'approved' }),
  })
);
```

Block image and font requests to speed up tests that do not validate visual content:

```typescript
await page.route('**/*.{png,jpg,jpeg,gif,webp,woff,woff2}', route =>
  route.abort()
);
```

---

## `expect.poll()` — Polling Custom Conditions

For conditions that Playwright cannot observe directly (e.g. a value returned by an API, a record written to a database), use `expect.poll()`:

```typescript
await expect.poll(async () => {
  const response = await page.request.get('/api/order/status');
  return (await response.json()).status;
}, {
  message: 'Order did not reach "completed" status',
  timeout: 10000,
  intervals: [1000, 2000, 5000], // retry after 1s, then 2s, then every 5s
}).toBe('completed');
```

`expect.poll()` retries the callback until the assertion passes or the timeout expires. Use it instead of `waitForTimeout` + a manual check.

---

## Retries — What They Tell You

Configuring retries does not fix flaky tests — it surfaces them with a label.

```typescript
retries: process.env.CI ? 2 : 0,
```

A test marked **flaky** in the report (failed then passed on retry) means:

1. The test has a timing dependency — something was not ready when the test acted on it
2. There is a shared state problem — another test or worker left the environment in a different state
3. The CI environment differs from local in a way that matters (slower, different screen size, different fonts)

Use retries on CI to prevent intermittent infrastructure noise from breaking your pipeline, while you fix the underlying cause. Do not increase retries as a long-term solution.

To detect a retry inside a test or fixture:

```typescript
test('my test', async ({ page }, testInfo) => {
  if (testInfo.retry) {
    // clean up any state left over from the previous attempt
    await page.goto('/reset');
  }
  // ...
});
```

---

## Debugging Flaky Tests with Traces

When a test fails intermittently on CI and passes locally, the trace viewer is the fastest way to diagnose it. See [docs/06-reporting](../06-reporting/README.md) for how to enable and open traces.

Once you have the trace open, the fastest debugging path:

1. **Actions panel** — find the action that failed. Look at the locator used and the duration
2. **Snapshots panel** — was the element actually in the DOM at that point? Was it visible?
3. **Network panel** — had the expected API call completed before the action? Or was the UI rendering with stale data?
4. **Log panel** — Playwright's internal log shows every wait step and what it was waiting for

Common trace findings and what they mean:

| What you see in the trace | Likely cause |
|--------------------------|-------------|
| Element not in DOM at time of action | Test acted before the page finished rendering |
| Element in DOM but outside viewport | Scroll or viewport size issue |
| Correct API response received, but UI not updated | React/Vue state update batching — add an assertion on the updated element |
| API call still pending when assertion ran | Race condition — wait for the response before asserting |
| Element present and visible but click hit another element | An overlay (modal, toast, cookie banner) was intercepting |

---

## Quick Reference — Replace These Patterns

| Instead of | Use |
|-----------|-----|
| `await page.waitForTimeout(2000)` | Remove it — auto-waiting handles it, or use a web-first assertion |
| `expect(await locator.isVisible()).toBe(true)` | `await expect(locator).toBeVisible()` |
| `expect(await locator.textContent()).toBe('x')` | `await expect(locator).toHaveText('x')` |
| `await page.waitForSelector('.spinner', { state: 'hidden' })` | `await expect(page.locator('.spinner')).toBeHidden()` |
| Manual sleep before navigation check | `await expect(page).toHaveURL(/expected-path/)` |
| Polling in a loop with `setTimeout` | `await expect.poll(() => ...).toBe(value)` |
