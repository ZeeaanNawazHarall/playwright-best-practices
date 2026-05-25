# Framework Architecture

> **Source**: Patterns in this section are based on the [official Playwright POM documentation](https://playwright.dev/docs/pom) and the [best practices guide](https://playwright.dev/docs/best-practices). Where a pattern goes beyond what Playwright documents officially, it is labeled as an **architectural decision**.

---

## Two Approaches

Playwright does not enforce a single framework style. The two most common approaches are:

| | Page Object Model (POM) | Script-based |
|---|---|---|
| **What it is** | Page interactions wrapped in classes | Locators and interactions written directly in tests or helper functions |
| **Playwright docs** | [Officially documented](https://playwright.dev/docs/pom) as a recommended pattern for large suites | Not formally named, but valid |
| **Best for** | Large suites, multiple engineers, repeated interactions across many test files | Smaller suites, fast iteration, less ceremony |
| **Main benefit** | Selectors centralized — one change updates every test that uses that page | Less indirection — tests are self-contained and easy to read |
| **Main cost** | More files, more structure to maintain | Selectors scattered across test files — harder to update when UI changes |

Neither is universally correct. The choice depends on suite size and team size.

---

## Page Object Model (POM)

### What Playwright's docs say

From [playwright.dev/docs/pom](https://playwright.dev/docs/pom):

> "A page object represents a part of your web application. An e-commerce web application might have a home page, a listings page and a checkout page. Each of them can be represented by page object models."

The two benefits stated:
1. **Authoring** — creates a higher-level API suited to your application
2. **Maintenance** — selectors are captured in one place

### Official pattern

Playwright's official example puts locators and methods in the same class:

```typescript
// playwright.dev example
import { type Locator, type Page } from '@playwright/test';

export class PlaywrightDevPage {
  readonly page: Page;
  readonly getStartedLink: Locator;
  readonly pomLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.pomLink = page.getByRole('link', { name: 'Page Object Model' });
  }

  async goto() {
    await this.page.goto('https://playwright.dev');
  }

  async getStarted() {
    await this.getStartedLink.first().click();
  }
}
```

Usage in a test:

```typescript
import { test, expect } from '@playwright/test';
import { PlaywrightDevPage } from './playwright-dev-page';

test('getting started should contain table of contents', async ({ page }) => {
  const playwrightDev = new PlaywrightDevPage(page);
  await playwrightDev.goto();
  await playwrightDev.getStarted();
  await expect(playwrightDev.page.getByRole('article')).toContainText('Installation');
});
```

---

## Split Locator/Action Pattern

> **Architectural decision** — not from official Playwright docs. This is a common pattern in enterprise frameworks, not a Playwright recommendation.

Some teams split the single POM class into two files per page:

```
pages/
  login/
    login.locators.ts   ← element definitions only
    login.actions.ts    ← business actions using those locators
```

### Why teams do this

The reasoning behind the split:

- **Locators change** when the UI is redesigned (element IDs change, labels change, structure changes)
- **Actions change** when business logic changes (new validation step added, flow reordered)
- Keeping them separate makes the change smaller and the diff clearer

### What it looks like

**login.locators.ts** — only element definitions, no logic:

```typescript
import { Locator, Page } from '@playwright/test';

export class LoginLocators {
  readonly usernameField: Locator;
  readonly passwordField: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    this.usernameField = page.getByLabel('Username');
    this.passwordField = page.getByLabel('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
  }
}
```

**login.actions.ts** — uses locators, adds business logic:

```typescript
import { Page } from '@playwright/test';
import { LoginLocators } from './login.locators';

export class LoginPage {
  private readonly locators: LoginLocators;

  constructor(private page: Page) {
    this.locators = new LoginLocators(page);
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async login(username: string, password: string) {
    await this.locators.usernameField.fill(username);
    await this.locators.passwordField.fill(password);
    await this.locators.loginButton.click();
  }
}
```

### Trade-offs

| | Split pattern | Single class |
|---|---|---|
| When UI changes | Update only the locator file | Update one class |
| Files per page | 2 | 1 |
| Readability | More files to navigate | Everything in one place |
| Team fit | Larger teams where UI and logic changes come separately | Smaller teams or simpler apps |

There is no objective winner. If the locator-only file starts growing its own logic, collapse it back into one class.

---

## Script-Based Approach

In a script-based framework, tests interact with the page directly — no class wrappers. Shared logic lives in plain helper functions.

```typescript
// Helper function — no class
async function fillCheckoutInfo(page: Page, firstName: string, lastName: string, zip: string) {
  await page.getByLabel('First name').fill(firstName);
  await page.getByLabel('Last name').fill(lastName);
  await page.getByLabel('Postal code').fill(zip);
  await page.getByRole('button', { name: 'Continue' }).click();
}

// Test file
test('Should proceed to checkout', async ({ loggedInPage }) => {
  await loggedInPage.getByRole('button', { name: 'Checkout' }).click();
  await fillCheckoutInfo(loggedInPage, 'Jane', 'Doe', '10001');
  await expect(loggedInPage.getByTestId('title')).toContainText('Checkout: Overview');
});
```

### When to use script-based

- Suites where only a small number of test files reference the same locators — if you change a selector and only one or two files need updating, inline is manageable
- Teams where speed of writing matters more than long-term maintainability
- Prototyping or exploratory testing

### The problem at scale

When locators are inline across many test files, a UI change to a single element requires searching all test files to find every reference. POM solves this by centralizing the locator.

---

## Folder Structure

Playwright does not prescribe a folder structure. The following is the most common convention in production TypeScript frameworks.

```
project-root/
├── playwright.config.ts
├── fixtures/
│   └── auth.ts              ← extended test object with auth fixtures
├── pages/                   ← page objects (one folder per page/feature)
│   ├── login/
│   │   ├── login.locators.ts
│   │   └── login.actions.ts
│   └── checkout/
│       ├── checkout.locators.ts
│       └── checkout.actions.ts
├── tests/
│   └── scenarios/           ← test files grouped by feature
│       ├── login.spec.ts
│       └── checkout.spec.ts
└── utils/
    ├── config.ts             ← environment variable access
    └── session.ts            ← session helpers (e.g. TTL checks)
```

### Key rules

- **One spec file per feature** — `checkout.spec.ts` contains only checkout scenarios
- **Fixtures live outside tests** — auth setup, page factory, or any reusable context belongs in `fixtures/`
- **`utils/` for pure helpers** — no Playwright imports in `utils/`; these are plain functions your page objects and fixtures call
- **`pages/` folder mirrors your app** — one folder per meaningful page or feature section, not one file per UI element

---

## Choosing Between the Two

> **Note**: Playwright's official docs do not prescribe a test count or suite size at which you should switch approaches. The guidance below is based on the practical trade-offs of each style.

The deciding factor is **locator maintenance cost** — how painful it is when a UI element changes.

- **If a selector change affects 2–3 test files**: script-based is manageable. Searching and updating a handful of files is fast.
- **If a selector change would ripple across many test files or many engineers' work**: POM pays off. One change in a locator file updates every test that uses that page.
- **If you already have POM and it's growing unwieldy**: consider the split locator/action pattern — it keeps UI changes and flow changes in separate diffs.

POM is not wrong for a small suite — the cost is just more files and structure upfront. A suite that starts small and grows is easier to manage if POM is already in place. The script approach is simpler to start and harder to refactor later; POM is more overhead to start but simpler to maintain at scale.

Both the [pom-framework](../../examples/pom-framework/) and [script-framework](../../examples/script-framework/) in this repo use the same test scenarios and auth fixture — comparing them side by side is the clearest way to see the trade-offs in practice.
