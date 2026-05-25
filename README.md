# Playwright Best Practices

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
| 10 | [Anti-Patterns](docs/10-anti-patterns/README.md) | 12 concrete before/after examples with official sources |

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

Working implementations you can clone and run. Both target [SauceDemo](https://www.saucedemo.com) and use the same test scenarios — comparing them is the clearest way to see the POM vs Script trade-off.

| Framework | Approach | What it demonstrates |
|-----------|----------|----------------------|
| [pom-framework](examples/pom-framework/) | Page Object Model with split locator/action classes | POM architecture, worker-cached login fixture, Allure reporting |
| [script-framework](examples/script-framework/) | Script-based, no page objects | Same scenarios with inline interactions and helper functions |

Both include:
- Login fixture with worker-scoped session caching and `storageState` persistence
- Allure + HTML reporting
- Multi-browser config (Chromium enabled, Firefox/WebKit commented and ready)
- `.env`-based credential management

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
    ├── pom-framework/       ← Page Object Model with split locator/action pattern
    └── script-framework/    ← Same scenarios, no page objects
```

---

## Stack

- **Language**: TypeScript
- **Framework**: Playwright Test (`@playwright/test`)
- **Reporting**: Allure + built-in HTML reporter + Trace Viewer
- **CI**: GitHub Actions / Azure DevOps
- **Auth**: `storageState` with worker-scoped fixture caching
- **Accessibility**: `@axe-core/playwright`
