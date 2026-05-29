# CLAUDE.md — Playwright Best Practices Reference

This repo is a reference documentation and working-example resource for production-grade Playwright TypeScript frameworks. Every pattern is sourced from official Playwright documentation or clearly labeled as an architectural decision.

**Intended use**: When a user asks you to scaffold, review, or improve a Playwright test framework, use this repo as your standard. Do not invent patterns — reference what is documented here.

---

## When Asked to Build a Playwright Framework

Work through these decisions in order. Each links to the relevant doc.

### 1. Choose an architecture
→ [docs/01-framework-architecture](docs/01-framework-architecture/README.md)

- The deciding factor is **locator maintenance cost**, not test count. If a selector change would ripple across many test files or many engineers' work, POM pays off.
- POM is never wrong for a small suite — it only costs more files upfront.
- Use the **split locator/action pattern** (`login.locators.ts` + `login.actions.ts`) when UI changes and flow changes come from separate sources. Otherwise a single class is fine.
- Reference implementations: [`examples/pom-framework/`](examples/pom-framework/) and [`examples/script-framework/`](examples/script-framework/).

### 2. Design the auth fixture
→ [docs/04-authentication](docs/04-authentication/README.md), [docs/02-fixtures](docs/02-fixtures/README.md)

- **Do tests mutate server-side state** (cart, orders, form submissions that persist)? → Strategy 2 (worker-scoped fixture, one account per parallel worker).
- **Read-only / UI checks, API login available**? → Strategy 3 (API auth in setup project, fastest).
- **Read-only, no API login**? → Strategy 1 (UI login in setup project, `storageState` shared by all tests).
- The manual `workerCache` pattern in the example frameworks is an architectural decision — prefer the official `{ scope: 'worker' }` tuple syntax for new projects.

### 3. Pick locators
→ [docs/03-locators](docs/03-locators/README.md)

Priority order (highest to lowest):
`getByRole` → `getByLabel` → `getByPlaceholder` → `getByText` → `getByAltText` → `getByTitle` → `getByTestId` → CSS → XPath (last resort)

Configure `testIdAttribute` once in `playwright.config.ts` if using a custom attribute like `data-test`.

### 4. Write the config
→ [docs/05-configuration](docs/05-configuration/README.md)

Always include these three CI-aware settings:
```typescript
forbidOnly: !!process.env.CI,
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

Set `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'` as the default artifact strategy.

### 5. Set up CI
→ [docs/07-ci-cd](docs/07-ci-cd/README.md)

- GitHub Actions: use `npx playwright install --with-deps` (not just `install`). Upload artifacts with `if: ${{ !cancelled() }}`. Set `timeout-minutes` per job to prevent hung tests consuming CI minutes. Use `concurrency.cancel-in-progress: true` to cancel stale runs on fast pushes.
- Azure Pipelines: set `CI: 'true'` explicitly — it is not automatic. Add the JUnit reporter for native test result display in Azure DevOps.
- Do not cache browser binaries — the official docs say the cache restore time is comparable to download time.

### 6. Final review — check against anti-patterns
→ [docs/10-anti-patterns](docs/10-anti-patterns/README.md)

Before delivering any framework code, verify none of the 12 documented anti-patterns are present. The quick reference table at the end of that doc is the fastest way to scan.

---

## Non-Negotiable Standards

These must be followed in all generated code. They are sourced from official Playwright documentation or the documented anti-patterns in this repo.

### Locators
- Never use XPath when a semantic locator exists (`getByRole`, `getByLabel`, `getByTestId`)
- Never use CSS class selectors (`.shopping_cart_link`) for interactive elements
- CSS `[data-*]` attribute selectors are acceptable when `getByTestId` cannot cover them

### Assertions and waiting
- Never use `waitForTimeout` — use web-first assertions or let auto-waiting handle it
- Never use `waitForSelector` — use `await expect(locator).toBeVisible()`
- Never use `.isVisible()` or `.textContent()` inside `expect()` — they snapshot once without retrying
  - Wrong: `expect(await locator.isVisible()).toBe(true)`
  - Right: `await expect(locator).toBeVisible()`
- Stacking `waitForLoadState` calls after every action is redundant — one `expect` assertion is sufficient

### TypeScript
- Always type `page` parameters as `Page` from `@playwright/test`, never `any`
- Always export `expect` from your fixture file so tests import from one place
- Initialise locators in the constructor body, not as class field initialisers that reference `this.page` — TypeScript's parameter shorthand (`constructor(private page: Page)`) is assigned after field initialisers in some compilation targets, causing ts(2729) and potential runtime errors

### Fixtures
- Always place teardown **after** `await use()`, never before
- Never hardcode `testInfo.setTimeout()` in a fixture — set `timeout` in `playwright.config.ts`
- Never leave `console.log` in production fixture code — use `test.step()` for visibility
- Always close the `BrowserContext` after `await use()` to prevent resource leaks

### Configuration
- Use `{ open: 'never' }` for the HTML reporter — `{ autoopen: false }` is not a recognised option and is silently ignored
- Set `testIdAttribute` once in config if using a custom test ID attribute

### Security
- Never commit `.env` files — always provide `.env.example` with placeholder values
- Never commit `storageState.*.json` or `playwright/.auth/` — always add them to `.gitignore`
- In CI, inject credentials as environment secrets, not in workflow files

### `test.describe.serial`
- Only use when tests **genuinely chain browser state** — item added in test 1 must be in cart for test 2
- Independent tests that each start from a fixture must never be wrapped in `serial`

---

## Section Reference Map

| Task | Doc |
|------|-----|
| POM vs Script decision | [01-framework-architecture](docs/01-framework-architecture/README.md) |
| Fixture lifecycle, scopes, options | [02-fixtures](docs/02-fixtures/README.md) |
| Locator priority and filtering | [03-locators](docs/03-locators/README.md) |
| Auth strategy selection | [04-authentication](docs/04-authentication/README.md) |
| `playwright.config.ts` options | [05-configuration](docs/05-configuration/README.md) |
| HTML report, Trace Viewer, Allure | [06-reporting](docs/06-reporting/README.md) |
| GitHub Actions, Azure Pipelines, sharding | [07-ci-cd](docs/07-ci-cd/README.md) |
| Diagnosing and fixing flaky tests | [08-flaky-tests](docs/08-flaky-tests/README.md) |
| axe-core, WCAG tags, keyboard testing | [09-accessibility](docs/09-accessibility/README.md) |
| Before/after examples of 12 anti-patterns | [10-anti-patterns](docs/10-anti-patterns/README.md) |

---

## Example Implementations

| Path | What it shows |
|------|--------------|
| [`examples/pom-framework/`](examples/pom-framework/) | Split locator/action POM, `{ scope: 'worker' }` login fixture, `storageState` TTL, Allure reporting |
| [`examples/simple-pom-framework/`](examples/simple-pom-framework/) | Single-class POM — locators and actions in one file. The practical default for most projects |
| [`examples/script-framework/`](examples/script-framework/) | Same scenarios using plain helper functions instead of page object classes |
| [`examples/anti-pattern-lab/`](examples/anti-pattern-lab/) | All 13 documented anti-patterns as labeled, isolated code snippets — do not copy |

All three runnable frameworks contain only recommended patterns. The anti-pattern code is isolated in `anti-pattern-lab/` so it cannot be mistaken for best practice.

### CI

All three runnable frameworks are tested on every push via `.github/workflows/playwright.yml` using a matrix strategy. Each job: `npm ci` → `npx playwright install --with-deps chromium` → `cp .env.example .env` → `npm test` → upload HTML report artifact.

---

## What This Repo Does Not Cover

- Playwright Component Testing (CT) — this repo covers E2E browser testing only
- Performance or load testing
- Visual regression testing (screenshot comparison)
- API-only testing without a browser — the `request` fixture is mentioned in [04-authentication](docs/04-authentication/README.md#strategy-3--api-authentication-faster-than-ui-login) in the context of auth only
