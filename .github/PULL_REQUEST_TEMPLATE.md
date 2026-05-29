## Related issue

Fixes # (if applicable)

---

## What does this PR change?

<!-- One sentence. "Adds anti-pattern #N", "Fixes broken locator in pom-framework", "Adds CI sharding section", etc. -->

## Type of change

- [ ] Bug fix — corrects wrong documentation or broken example code
- [ ] New content — adds a pattern, anti-pattern, or documentation section
- [ ] New example framework or significant framework change
- [ ] CI / tooling change
- [ ] Refactor / cleanup (no content change)

---

## Documentation checklist

- [ ] Every pattern I document is either from the [official Playwright docs](https://playwright.dev/docs/best-practices) **or** clearly labeled as an **Architectural Decision (beyond official docs)**
- [ ] I have not added comments that say "added for issue #X" or describe the implementation — code should speak for itself
- [ ] If I added a new anti-pattern, it appears in both `docs/10-anti-patterns/README.md` and the Quick Reference table at the bottom

## Code checklist (runnable example frameworks only)

- [ ] No `waitForTimeout` in any test or fixture
- [ ] No XPath locators when a semantic locator (`getByRole`, `getByLabel`, `getByTestId`) exists
- [ ] No `page: any` — all page parameters typed as `Page` from `@playwright/test`
- [ ] Locators initialised in the constructor body, not as class field initialisers referencing `this.page`
- [ ] No `.env` file committed — only `.env.example` with placeholder or public credentials

## Test plan (framework changes only)

<!-- Which frameworks did you run, and what commands did you use? -->

```bash
# Example:
cd examples/pom-framework && npm test
cd examples/script-framework && npm test
cd examples/simple-pom-framework && npm test
```

**Frameworks tested:**
- [ ] pom-framework — all tests pass
- [ ] script-framework — all tests pass
- [ ] simple-pom-framework — all tests pass

## Anti-pattern lab checklist (if changing `examples/anti-pattern-lab/`)

- [ ] Bad patterns are labeled `// ❌ Anti-pattern #N:`
- [ ] Good patterns are labeled `// ✅`
- [ ] The file is reference code only — it is not a runnable test suite
