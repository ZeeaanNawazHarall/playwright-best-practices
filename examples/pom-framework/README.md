# Example: POM Framework

A Page Object Model framework for [SauceDemo](https://www.saucedemo.com) using Playwright TypeScript.

This example demonstrates the patterns documented in:
- [01 — Framework Architecture](../../docs/01-framework-architecture/README.md) — split locator/action POM
- [02 — Fixtures](../../docs/02-fixtures/README.md) — worker-cached login fixture
- [04 — Authentication](../../docs/04-authentication/README.md) — `storageState` with TTL expiry
- [05 — Configuration](../../docs/05-configuration/README.md) — multi-browser, Allure + HTML reporter
- [10 — Anti-Patterns](../../docs/10-anti-patterns/README.md) — see this file for patterns to avoid

---

## What It Demonstrates

### Split locator/action pattern

Each page is split into two files — one for element definitions, one for business actions:

```
pages/
  login/
    login.locators.ts   ← Locator definitions only
    login.actions.ts    ← Methods that use those locators
  product/
    product.locators.ts
    product.actions.ts
  cart/
    cart.locators.ts
    cart.actions.ts
  checkout/
    checkout.locators.ts
    checkout.actions.ts
```

When the UI changes, only the locator file changes. When the flow changes, only the action file changes.

See [docs/01-framework-architecture](../../docs/01-framework-architecture/README.md#split-locatoraction-pattern) for the trade-off discussion.

### Worker-cached login fixture

`fixtures/login.ts` logs in once per Playwright worker and reuses the same `Page` object across all serial tests in that worker — no re-login between tests.

Key pieces:
- `workerCache: Map<number, Page>` — keyed by `testInfo.workerIndex`
- `storageState` saved to a per-browser JSON file with a 10-minute TTL
- If the session file exists and is fresh, it is loaded instead of logging in again

See [docs/02-fixtures](../../docs/02-fixtures/README.md#manual-worker-cache-pattern) for how this differs from the official `{ scope: 'worker' }` pattern.

### `test.describe.serial` for dependent flows

The checkout and cart test suites use `test.describe.serial` because each step depends on the state left by the previous one — item in cart, cart viewed, checkout started:

```typescript
test.describe.serial('Checkout Flow', () => {
  test('Should add item to cart', ...);
  test('Should display cart with item', ...);
  test('Should proceed to checkout', ...);
  test('Should complete order', ...);
});
```

See [docs/10-anti-patterns](../../docs/10-anti-patterns/README.md#12-testdescribeserial-without-a-real-dependency) for when *not* to use `serial`.

---

## Folder Structure

```
pom-framework/
├── playwright.config.ts
├── package.json
├── .env.example
├── fixtures/
│   └── login.ts              ← Extended test with loggedInPage fixture
├── pages/
│   ├── login/
│   │   ├── login.locators.ts
│   │   └── login.actions.ts
│   ├── product/
│   │   ├── product.locators.ts
│   │   └── product.actions.ts
│   ├── cart/
│   │   ├── cart.locators.ts
│   │   └── cart.actions.ts
│   └── checkout/
│       ├── checkout.locators.ts
│       └── checkout.actions.ts
├── tests/
│   └── scenarios/
│       ├── Login.spec.ts
│       ├── cart.spec.ts
│       ├── checkout.spec.ts
│       ├── sorting.spec.ts
│       ├── duplicate-checkout-no-pom.spec.ts  ← Same flow without POM (for comparison)
│       └── flakiness-edge-cases.spec.ts        ← Deliberate anti-pattern examples
└── utils/
    ├── config.ts             ← Env var access with early validation
    └── session.ts            ← storageState TTL helper
```

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
TEST_USER=standard_user
PASSWORD=secret_sauce
```

---

## Running Tests

```bash
# All tests
npm test

# Chromium only
npm run test:chromium

# Headed (visible browser)
npm run test:headed

# Debug mode
npm run test:debug
```

### Run individual scenarios

```bash
# Login scenario
npx playwright test tests/scenarios/Login.spec.ts

# Checkout flow
npx playwright test tests/scenarios/checkout.spec.ts

# Product sorting
npx playwright test tests/scenarios/sorting.spec.ts

# Cart management
npx playwright test tests/scenarios/cart.spec.ts

# Script-style comparison (no POM)
npx playwright test tests/scenarios/duplicate-checkout-no-pom.spec.ts
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

## Anti-Patterns

This framework follows Playwright best practices throughout. The before/after examples for all 12 documented anti-patterns are in [`examples/anti-pattern-lab/`](../anti-pattern-lab/) and [`docs/10-anti-patterns/`](../../docs/10-anti-patterns/README.md).

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

**Tests failing with timeout**
Increase the timeout in `playwright.config.ts` rather than in individual fixtures or tests.
