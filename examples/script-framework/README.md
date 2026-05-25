# Example: Script Framework

A script-based (non-POM) framework for [SauceDemo](https://www.saucedemo.com) using Playwright TypeScript.

This example covers the same test scenarios as [pom-framework](../pom-framework/README.md) with no page object classes — interactions are written directly in tests or extracted into plain helper functions.

Comparing these two frameworks side-by-side is the most direct way to understand the POM vs Script trade-off.

---

## What It Demonstrates

### No page objects — interactions inline or in helper functions

```typescript
// Helper function — a plain function, no class
async function fillCheckoutInfo(
  page: Page,
  firstName: string,
  lastName: string,
  zip: string
) {
  await page.locator('[data-test="firstName"]').fill(firstName);
  await page.locator('[data-test="lastName"]').fill(lastName);
  await page.locator('[data-test="postalCode"]').fill(zip);
  await page.locator('[data-test="continue"]').click();
  await page.waitForLoadState('domcontentloaded');
}
```

There is no `pages/` folder, no locator classes, no action classes. Everything lives in the test file or a shared helper.

### Same fixture, same scenarios

`fixtures/login.ts` is structurally identical to the POM version — the same worker cache, the same `storageState` TTL logic. The difference is a `performLogin` helper function extracted from the fixture body, rather than calling a `LoginPage` class.

```typescript
// Script version — plain function
async function performLogin(page: Page) {
  await page.goto(appConfig.url);
  await page.locator('//*[@id="user-name"]').fill(appConfig.getUsername());
  await page.locator('[data-test="password"]').fill(appConfig.getPassword());
  await page.locator('[data-test="login-button"]').click();
  await page.waitForLoadState('domcontentloaded');
  // ...
}
```

---

## Folder Structure

```
script-framework/
├── playwright.config.ts
├── package.json
├── .env.example
├── fixtures/
│   └── login.ts              ← Same worker-cache pattern as POM version
├── tests/
│   └── scenarios/
│       ├── Login.spec.ts
│       ├── checkout.spec.ts
│       ├── sorting.spec.ts
│       ├── duplicate-checkout-no-pom.spec.ts
│       └── flakiness-edge-cases.spec.ts
└── utils/
    ├── config.ts             ← Identical to POM version
    └── session.ts            ← Identical to POM version
```

No `pages/` directory — that is the defining structural difference.

---

## POM vs Script — Side-by-Side

The same checkout flow written in both styles:

**POM** (`pom-framework/tests/scenarios/checkout.spec.ts`):

```typescript
import { test } from '../../fixtures/login';
import { CartPage } from '../../pages/cart/cart.actions';
import { CheckoutPage } from '../../pages/checkout/checkout.actions';

test('Should proceed to checkout', async ({ loggedInPage }) => {
  const cart = new CartPage(loggedInPage);
  const checkout = new CheckoutPage(loggedInPage);

  await cart.proceedToCheckout();
  await checkout.fillCheckoutInfo('Jane', 'Doe', '10001');

  const overview = await checkout.getOverviewDetails();
  expect(overview.title).toBe('Checkout: Overview');
});
```

**Script** (`script-framework/tests/scenarios/checkout.spec.ts`):

```typescript
import { test } from '../../fixtures/login';

test('Should proceed to checkout', async ({ loggedInPage }) => {
  await loggedInPage.locator('[data-test="checkout"]').click();
  await fillCheckoutInfo(loggedInPage, 'Jane', 'Doe', '10001');

  await expect(loggedInPage.locator('[data-test="title"]'))
    .toContainText('Checkout: Overview');
});
```

**What changes**: the Script version is more direct — each action is visible in the test body. The POM version is more abstract — `cart.proceedToCheckout()` hides the implementation.

**The maintenance difference**: if the `[data-test="checkout"]` selector changes, you update one locator file in POM. In the script version, you search all test files for every reference to that selector.

See [docs/01-framework-architecture](../../docs/01-framework-architecture/README.md#choosing-between-the-two) for when each approach pays off.

---

## Prerequisites

- Node.js v18 or higher
- npm (comes with Node.js)

---

## Setup

```bash
npm install
npx playwright install
```

Copy the example env file and fill in credentials:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

`.env.example`:

```
APP_URL=https://www.saucedemo.com
USER=standard_user
PASSWORD=secret_sauce
```

---

## Running Tests

```bash
# All tests
npm test

# Chromium only
npm run test:chromium

# Headed
npm run test:headed
```

### Run individual scenarios

```bash
# Login scenario
npx playwright test tests/scenarios/Login.spec.ts

# Checkout flow
npx playwright test tests/scenarios/checkout.spec.ts

# Product sorting
npx playwright test tests/scenarios/sorting.spec.ts
```

---

## Viewing Reports

```bash
# Playwright HTML report
npm run report

# Allure (requires Java)
npx allure serve allure-results
```

---

## Known Anti-Patterns in This Framework

The fixture (`fixtures/login.ts`) contains the same documented anti-patterns as the POM version — they are left intentionally for comparison. See [docs/10-anti-patterns](../../docs/10-anti-patterns/README.md).

| File | Anti-pattern | Fix |
|------|-------------|-----|
| `fixtures/login.ts` | XPath `'//*[@id="user-name"]'` in `performLogin` | `page.getByLabel('Username')` |
| `fixtures/login.ts` | No teardown after `await use()` | `await context.close()` after `use()` |
| `fixtures/login.ts` | `testInfo.setTimeout(60000)` in fixture | Set `timeout` in `playwright.config.ts` |
| `fixtures/login.ts` | `console.log` statements | `test.step()` or remove |
| `fixtures/login.ts` | Redundant `waitForLoadState` calls | Remove — use one `expect` assertion |
| `tests/scenarios/checkout.spec.ts` | `.shopping_cart_link` CSS class | `page.getByRole('link', { name: 'Shopping cart' })` |

---

## Troubleshooting

**Session not loading / redirected to login page**
Delete the `storageState.*.json` files to force a fresh login:
```bash
# Windows
del storageState.*.json

# macOS / Linux
rm storageState.*.json
```

**Missing browser binaries**
```bash
npx playwright install
```
