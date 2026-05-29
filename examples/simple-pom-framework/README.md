# Simple POM Framework

A Playwright TypeScript example using the standard Page Object Model — each page class contains both its locator definitions and its action methods in a single file.

This is **the practical middle ground** between script-based testing and the [split locator/action POM](../pom-framework/) used in large-scale frameworks. It is the right choice for most projects.

---

## When to Use This Pattern

| Situation | Use this pattern? |
|-----------|------------------|
| Solo developer or small team (1-5 engineers) | Yes |
| Single codebase, 5–100 page objects | Yes |
| UI changes and test logic changes happen together | Yes |
| Multiple teams sharing the same locator definitions | No — use [split POM](../pom-framework/) |
| Hundreds of page objects across a large monorepo | No — use [split POM](../pom-framework/) |

When a selector changes, you update one class. You will feel the maintenance cost only when **multiple teams are editing the same locator definitions at the same time** — that is the moment to introduce the split.

---

## What Makes This "Simple POM"

The key difference from `pom-framework/` is that each page class has locators as **private class properties** alongside its public action methods — no separate `.locators.ts` file.

```typescript
// pages/LoginPage.ts — locators and actions in one place
export class LoginPage {
  readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByTestId("username");
    this.passwordInput = page.getByTestId("password");
    this.loginButton = page.getByTestId("login-button");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

Compare this with the split pattern in `pom-framework/` which has `login.locators.ts` and `login.actions.ts` as separate files. Both are correct — the split version pays off when locator changes and action changes come from different sources (different teams, different cadences).

---

## Prerequisites

- Node.js v18+
- A `.env` file (copy from `.env.example`)

## Quick Start

```bash
npm install
npx playwright install
```

Copy the env file:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Run all tests:

```bash
npm test
```

Run in headed mode to watch the browser:

```bash
npm run test:headed
```

Open the HTML report:

```bash
npm run report
```

---

## Project Structure

```
simple-pom-framework/
├── playwright.config.ts
├── .env.example
├── fixtures/
│   └── auth.ts              ← worker-scoped loggedInPage fixture
├── pages/
│   ├── LoginPage.ts         ← locators + actions together
│   ├── InventoryPage.ts
│   ├── CartPage.ts
│   └── CheckoutPage.ts
├── tests/
│   └── scenarios/
│       ├── login.spec.ts
│       ├── sorting.spec.ts
│       ├── cart.spec.ts
│       └── checkout.spec.ts
└── utils/
    └── config.ts
```

## Test Scenarios

| Scenario | File | Notes |
|----------|------|-------|
| Login verification | `login.spec.ts` | Asserts inventory page loads |
| Product sorting | `sorting.spec.ts` | A-Z, Z-A, price low-to-high |
| Cart management | `cart.spec.ts` | Serial — tests chain cart state |
| Checkout flow | `checkout.spec.ts` | Serial — tests chain state through purchase |

## Comparing the Three Frameworks

| | [script-framework](../script-framework/) | [simple-pom-framework](.) | [pom-framework](../pom-framework/) |
|---|---|---|---|
| Locators | Inline in test files | Private class properties | Separate `.locators.ts` files |
| Actions | Helper functions | Public class methods | Separate `.actions.ts` files |
| Files per page | 0 extra files | 1 file | 2 files |
| Best for | Prototyping, small suites | Most projects | Large teams, large monorepos |

---

## Anti-Patterns

This framework follows Playwright best practices throughout. See [`examples/anti-pattern-lab/`](../anti-pattern-lab/) and [`docs/10-anti-patterns/`](../../docs/10-anti-patterns/README.md).
