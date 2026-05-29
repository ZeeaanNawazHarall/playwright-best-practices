# Anti-Pattern Lab

> **This directory contains intentionally broken code.**
>
> Every file here demonstrates a Playwright anti-pattern — the kind of code that looks reasonable, runs locally, and quietly causes problems at scale. None of it should be copied into a real project.

The clean, recommended implementations are in [pom-framework/](../pom-framework/) and [script-framework/](../script-framework/). The full before/after explanation for each pattern is in [docs/10-anti-patterns/](../../docs/10-anti-patterns/README.md).

---

## Files

| File | Anti-patterns demonstrated |
|------|---------------------------|
| [locators.ts](locators.ts) | #1 XPath locators, #2 CSS class selectors |
| [waiting.ts](waiting.ts) | #3 `waitForTimeout`, #4 `waitForSelector`, #9 redundant `waitForLoadState` |
| [assertions.ts](assertions.ts) | #5 `.isVisible()` and `.textContent()` inside `expect()` |
| [types.ts](types.ts) | #6 `page: any` instead of `page: Page` |
| [config.ts](config.ts) | #7 HTML reporter `autoopen`, #10 `testInfo.setTimeout` in fixture |
| [fixtures.ts](fixtures.ts) | #8 no teardown after `await use()`, #11 `console.log` in fixture |
| [specs.ts](specs.ts) | #12 `test.describe.serial` without a real dependency |

---

## Why this exists

Before cleanup, `pom-framework/` and `script-framework/` contained these anti-patterns mixed into working code. A junior engineer cloning those frameworks could learn the wrong lessons without realising it.

The lab isolates the bad patterns here where they cannot be mistaken for recommended practice.

Each file shows:
- `// ❌` — the anti-pattern with an explanation of what goes wrong
- `// ✅` — the correct replacement

The full context, official sources, and deeper explanations are in [docs/10-anti-patterns/](../../docs/10-anti-patterns/README.md).
