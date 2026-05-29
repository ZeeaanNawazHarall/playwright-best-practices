# Playwright Best Practices

[![CI](https://github.com/ZeeaanNawazHarall/playwright-best-practices/actions/workflows/playwright.yml/badge.svg)](https://github.com/ZeeaanNawazHarall/playwright-best-practices/actions/workflows/playwright.yml)
[![Playwright](https://img.shields.io/badge/Playwright-1.52+-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Production-grade Playwright patterns for scalable UI/API automation.

Built from real SDET engineering experience — framework architecture, authentication, CI pipelines, flaky test prevention, accessibility, and more. Every pattern in this repo is sourced from the [official Playwright documentation](https://playwright.dev/docs/best-practices) or clearly labeled as an architectural decision.

---

## Who This Is For

- SDETs and QA Automation Engineers
- Developers adding Playwright to a project
- Anyone scaling Playwright beyond "it works on my machine"

---

## What This Covers

| # | Section | What You'll Learn |
|---|---------|-------------------|
| 01 | [Framework Architecture](docs/01-framework-architecture/README.md) | POM vs Script, split locator/action pattern, folder structure |
| 02 | [Fixtures](docs/02-fixtures/README.md) | Fixture lifecycle, test vs worker scope, auth fixtures, manual cache pattern |
| 03 | [Locators](docs/03-locators/README.md) | Priority order, `getByRole` vs XPath vs CSS, `testIdAttribute`, filtering |
| 04 | [Authentication](docs/04-authentication/README.md) | `storageState`, setup projects, multi-role testing, session storage |
| 05 | [Configuration](docs/05-configuration/README.md) | `playwright.config.ts` — projects, retries, reporters, timeouts, env layering |
| 06 | [Reporting](docs/06-reporting/README.md) | HTML reporter, Trace Viewer, Allure setup and configuration |
| 07 | [CI/CD](docs/07-ci-cd/README.md) | GitHub Actions, Azure Pipelines, sharding, secrets, artifact upload |
| 08 | [Flaky Tests](docs/08-flaky-tests/README.md) | Root causes, hard waits, race conditions, `expect.poll`, trace debugging |
| 09 | [Accessibility](docs/09-accessibility/README.md) | axe-core setup, WCAG tags, keyboard navigation, focus management |
| 10 | [Anti-Patterns](docs/10-anti-patterns/README.md) | 13 concrete before/after examples with official sources |

---

## Learning Paths

### Beginner — Just starting with Playwright

1. [Configuration](docs/05-configuration/README.md) — understand the config file first
2. [Locators](docs/03-locators/README.md) — learn how to find elements reliably
3. [Framework Architecture](docs/01-framework-architecture/README.md) — structure your project correctly
4. [Reporting](docs/06-reporting/README.md) — read the HTML report and trace viewer

### Intermediate — Building a real suite

1. [Authentication](docs/04-authentication/README.md) — stop logging in on every test
2. [Fixtures](docs/02-fixtures/README.md) — share setup across tests properly
3. [Flaky Tests](docs/08-flaky-tests/README.md) — make your suite stable
4. [CI/CD](docs/07-ci-cd/README.md) — run tests on every pull request

### Advanced — Production readiness

1. [Anti-Patterns](docs/10-anti-patterns/README.md) — audit your existing suite
2. [Accessibility](docs/09-accessibility/README.md) — automate WCAG compliance checks
3. [Reporting](docs/06-reporting/README.md) — Allure, environment info, issue tracker links

---

## Example Frameworks

Working implementations you can clone and run. All three target [SauceDemo](https://www.saucedemo.com) and cover the same test scenarios — comparing them shows the full spectrum of Playwright architecture options.

| Framework | Approach | What it demonstrates |
|-----------|----------|----------------------|
| [script-framework](examples/script-framework/) | Script-based, no page objects | Inline interactions and plain helper functions |
| [simple-pom-framework](examples/simple-pom-framework/) | POM — locators and actions in one class | **Start here.** The right choice for most projects |
| [pom-framework](examples/pom-framework/) | Split locator/action POM | Advanced pattern for large teams; `storageState` TTL, Allure reporting |
| [anti-pattern-lab](examples/anti-pattern-lab/) | Intentional bad code — do not copy | All 13 documented anti-patterns in labeled, isolated files |

All three runnable frameworks include:
- `{ scope: 'worker' }` login fixture with `storageState` session persistence
- HTML reporting
- Multi-browser config (Chromium enabled, Firefox/WebKit commented and ready)
- `.env`-based credential management

---

## Scaling Your Test Architecture

Pick the simplest approach that solves your current problem. Move up only when you feel the pain that pattern solves.

| Your situation | Recommended approach | Example |
|:---|:---|:---|
| Prototyping, few tests, solo developer | Script-based — no page objects | [script-framework](examples/script-framework/) |
| Growing project, 1–5 engineers, most teams | Simple POM — locators + actions in one class | [simple-pom-framework](examples/simple-pom-framework/) |
| Large monorepo, multiple teams sharing locators | Split Locator/Action POM — separate files | [pom-framework](examples/pom-framework/) |

**The split locator/action pattern is not the default.** It pays off specifically when UI changes (locators) and business logic changes (actions) come from different teams at different cadences. For most projects, a single-class POM is simpler and sufficient.

→ Full justification with decision criteria: [Framework Architecture docs](docs/01-framework-architecture/README.md)

### Framework Comparison

| | [script-framework](examples/script-framework/) | [simple-pom-framework](examples/simple-pom-framework/) | [pom-framework](examples/pom-framework/) |
|---|---|---|---|
| **Complexity** | Low | Medium | High |
| **Files per page** | 0 (no classes) | 1 | 2 (`locators.ts` + `actions.ts`) |
| **Locator reuse** | Manual — copy-paste or shared constants | Encapsulated in page class | Fully decoupled — locators sharable without importing action logic |
| **When a selector changes** | Find all usages manually | Update one property in one class | Update one locator file; action classes unaffected |
| **When a flow changes** | Edit the helper function | Edit one method in one class | Edit the action class; locator file unaffected |
| **Allure reporting** | Yes | No (HTML + JSON only) | Yes |
| **Best for** | Spike testing, rapid prototyping | The default for most teams | Teams where UI and business logic change independently |

---

## Quick Start

```bash
cd examples/pom-framework
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

Run all tests:

```bash
npm test
```

Run a specific browser:

```bash
npm run test:chromium
```

Open the HTML report:

```bash
npm run report
```

---

## FAQ

**Why do you have a split locator/action pattern? Isn't that over-engineering?**
For most projects, yes — a single-class POM is sufficient. The split pays off specifically at large scale: multiple teams editing shared locator definitions, or when UI redesigns and business logic changes arrive separately and need isolated diffs. The [scaling guide](#scaling-your-test-architecture) maps each pattern to the situation that justifies it.

**Which framework should I start from?**
Start with [simple-pom-framework](examples/simple-pom-framework/). Only adopt the split pattern if you feel the maintenance pain it solves — locator changes rippling across many files touched by different engineers.

**What's in anti-pattern-lab?**
Intentional bad code showing all 13 documented anti-patterns in labeled, isolated TypeScript files. It exists so the patterns-to-avoid are physically separated from the recommended implementations. Do not copy from it.

**Can I use these frameworks with a different app?**
Yes. All three use environment variables (`APP_URL`, `USER`, `PASSWORD`) via `.env`. Point `APP_URL` at your app and update the locators in the page objects.

---

## Key Principles

These run through every section of this repo.

**1. Never log in inside a test.**
Authentication belongs in fixtures. Tests should start already authenticated.
→ [Authentication](docs/04-authentication/README.md)

**2. Prefer role-based locators.**
`getByRole()` > `getByLabel()` > `getByTestId()` > CSS > XPath (last resort).
→ [Locators](docs/03-locators/README.md)

**3. Never use `waitForTimeout`.**
Hard waits are flaky by definition. Use web-first assertions — they poll automatically.
→ [Flaky Tests](docs/08-flaky-tests/README.md)

**4. Isolate tests from each other.**
Tests sharing state fail randomly under parallelism. Each test should own its data.
→ [Fixtures](docs/02-fixtures/README.md), [Anti-Patterns](docs/10-anti-patterns/README.md)

**5. Put every option in `playwright.config.ts`.**
Retries, timeouts, and reporter config scattered across fixtures and test files become invisible and hard to change.
→ [Configuration](docs/05-configuration/README.md)

**6. Automated accessibility scans catch regressions, not everything.**
Axe-core finds rule violations automatically. It cannot verify reading order, screen reader announcements, or real keyboard usability.
→ [Accessibility](docs/09-accessibility/README.md)

---

## Repo Structure

```
playwright-best-practices/
├── README.md
├── CLAUDE.md
├── LICENSE
├── docs/
│   ├── 01-framework-architecture/
│   ├── 02-fixtures/
│   ├── 03-locators/
│   ├── 04-authentication/
│   ├── 05-configuration/
│   ├── 06-reporting/
│   ├── 07-ci-cd/
│   ├── 08-flaky-tests/
│   ├── 09-accessibility/
│   └── 10-anti-patterns/
└── examples/
    ├── script-framework/        ← Script-based, no page objects
    ├── simple-pom-framework/    ← Standard POM — locators + actions in one class (start here)
    ├── pom-framework/           ← Split locator/action POM for large teams
    └── anti-pattern-lab/        ← Intentional bad code for each documented anti-pattern
```

---

## Stack

- **Language**: TypeScript
- **Framework**: Playwright Test (`@playwright/test`)
- **Reporting**: Allure + built-in HTML reporter + Trace Viewer
- **CI**: GitHub Actions / Azure DevOps
- **Auth**: `storageState` with worker-scoped fixture caching
- **Accessibility**: `@axe-core/playwright`

---

## Project Status

Current version: **v1.0.0** — see [CHANGELOG.md](CHANGELOG.md) for release history.

### Roadmap

These are planned additions. Open an issue if you want to contribute any of them.

| Status | Item |
|--------|------|
| Planned | Docker-based local runner (`docker compose up`) so examples run without a local Node install |
| Planned | Azure Pipelines example workflow alongside the existing GitHub Actions one |
| Planned | Sharding example for parallelising a large suite across multiple CI agents |
| Planned | Multi-role auth example (admin + standard user in the same test run) |
| Planned | Request interception / API mocking patterns |
| Out of scope | Playwright Component Testing (CT) |
| Out of scope | Visual regression / screenshot comparison |
| Out of scope | Performance / load testing |
