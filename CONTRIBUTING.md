# Contributing to playwright-best-practices

Thank you for your interest in improving this resource. This repo exists to be a reliable, community-recognized reference for production-grade Playwright patterns — so quality and sourcing matter more than quantity.

---

## Philosophy

Every pattern in this repo must meet one of two bars:

1. **Sourced from the official Playwright docs** — link the exact page in your PR.
2. **Labeled as an Architectural Decision** — common in real projects but not officially prescribed. These must be clearly flagged in the documentation so readers know they are going beyond the official guidance.

If a pattern cannot be sourced or labeled, it does not belong here.

---

## Before You Open a PR

1. **Open an issue first** for any non-trivial change (new pattern, new anti-pattern, new example framework). This avoids duplicate effort and lets us agree on scope before you write code.
2. **Small, focused PRs** are easier to review and faster to merge. One pattern or one bug fix per PR.
3. Check that your change is not already covered in the [docs](docs/) or the [anti-patterns guide](docs/10-anti-patterns/README.md).

---

## Running the Example Frameworks Locally

All three example frameworks target [SauceDemo](https://www.saucedemo.com) and use the same public test credentials.

```bash
# Pick a framework
cd examples/pom-framework          # Split locator/action POM + Allure
# cd examples/simple-pom-framework # Standard single-class POM (start here)
# cd examples/script-framework     # Script-based, no page objects

# Install dependencies and browsers
npm install
npx playwright install chromium

# Copy credentials (public SauceDemo credentials — safe to commit in .env.example)
cp .env.example .env   # Windows: copy .env.example .env

# Run tests
npm test

# Open the HTML report
npx playwright show-report
```

---

## What You Can Contribute

| Type | Where |
|------|--------|
| Fix wrong or outdated documentation | Any `docs/` section |
| Add a new Playwright pattern with official source | `docs/` + relevant example framework |
| Add a new anti-pattern (must have real-world justification) | `docs/10-anti-patterns/README.md` + `examples/anti-pattern-lab/` |
| Fix a broken locator, type error, or failing test in an example framework | `examples/` |
| Improve CI / tooling | `.github/workflows/` |

**What does not belong here:**
- Patterns that are already deprecated in the Playwright docs
- Visual regression testing (screenshot comparison)
- Playwright Component Testing (CT)
- Performance or load testing
- Framework-specific wrappers (Cucumber, Mocha, etc.)

---

## Code Standards

These apply to all changes in the runnable example frameworks (`pom-framework`, `script-framework`, `simple-pom-framework`). The full reference is in [CLAUDE.md](CLAUDE.md).

- Never use `waitForTimeout` — use web-first assertions
- Never use XPath when `getByRole`, `getByLabel`, or `getByTestId` exists
- Never type `page` as `any` — always use `Page` from `@playwright/test`
- Initialise locators in the constructor body, not as class field initialisers using `this.page`
- Never commit `.env` — only `.env.example` with placeholder or public credentials

The anti-pattern lab (`examples/anti-pattern-lab/`) is reference code only. Bad patterns are labeled `// ❌` and good patterns `// ✅`. Do not "fix" the bad patterns — they are intentional.

---

## PR Checklist

The [pull request template](.github/PULL_REQUEST_TEMPLATE.md) has the full checklist. The short version:

- Source your pattern (official docs link or Architectural Decision label)
- Run `npm test` in every framework you changed
- Update the Quick Reference table if you added or changed an anti-pattern
- No `.env` committed

---

## Questions

Open a [GitHub issue](../../issues) and use the **Feature request** template to start a discussion.
