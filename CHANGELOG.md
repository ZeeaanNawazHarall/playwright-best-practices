# Changelog

All notable changes to this project are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] — 2026-05-29

Initial public release of the playwright-best-practices reference repo.

### Added

#### Documentation (10 sections)
- `docs/01-framework-architecture` — POM vs Script decision guide, split locator/action pattern, ADR-style justification
- `docs/02-fixtures` — Fixture lifecycle, test vs worker scope, auth fixtures, `workerCache` pattern vs official `{ scope: 'worker' }` tuple
- `docs/03-locators` — Priority order (`getByRole` → XPath), `testIdAttribute`, chaining and filtering
- `docs/04-authentication` — Three auth strategies with decision tree, `storageState` TTL, multi-role testing
- `docs/05-configuration` — `playwright.config.ts` full reference, CI-aware settings, env variable layering
- `docs/06-reporting` — HTML reporter, Trace Viewer, Allure setup and environment metadata
- `docs/07-ci-cd` — GitHub Actions with matrix strategy, Azure Pipelines with JUnit reporter, sharding
- `docs/08-flaky-tests` — Root cause taxonomy, `expect.poll`, `waitForFunction`, trace debugging workflow
- `docs/09-accessibility` — axe-core integration, WCAG 2.1 tags, keyboard navigation, focus management
- `docs/10-anti-patterns` — 13 documented anti-patterns with before/after examples and official source links

#### Example Frameworks
- `examples/pom-framework` — Split locator/action POM with `{ scope: 'worker' }` login fixture, `storageState` TTL, Allure reporting
- `examples/simple-pom-framework` — Single-class POM; the practical default for most projects
- `examples/script-framework` — Same test scenarios using plain helper functions instead of page object classes
- `examples/anti-pattern-lab` — All 13 anti-patterns as labeled, isolated TypeScript files (reference only — do not copy)

#### CI
- `.github/workflows/playwright.yml` — Matrix strategy running all three frameworks in parallel; `concurrency.cancel-in-progress` for stale-run cancellation; `timeout-minutes: 15` per job; `jq`-based post-test JSON validation; HTML report artifact upload with `if: !cancelled()`

#### Community Health Files
- `CONTRIBUTING.md` — Philosophy, local setup, code standards, PR checklist
- `SECURITY.md` — Scope, vulnerability reporting via GitHub private advisories, out-of-scope list
- `CODE_OF_CONDUCT.md` — References Contributor Covenant v2.1
- `.github/ISSUE_TEMPLATE/bug_report.md` — Structured bug report with trace attachment reminder
- `.github/ISSUE_TEMPLATE/feature_request.md` — Feature request with real-world impact section
- `.github/PULL_REQUEST_TEMPLATE.md` — Checklist with per-framework test verification and source link requirement

#### Root Documentation
- `README.md` — Learning paths by experience level, framework comparison table, scaling guide, roadmap
- `CLAUDE.md` — AI-agent instruction file: standards, anti-pattern guard, section reference map
- `CHANGELOG.md` — This file

### Fixed

- TypeScript ts(2729) in all three example frameworks: locators moved from class field initialisers to constructor body to avoid use-before-init with `constructor(private page: Page)` shorthand
- SauceDemo locator bug: `getByTestId("user-name")` corrected to `getByTestId("username")` in all frameworks and documentation (the actual `data-test` attribute value has no hyphen)
- `tsconfig.json` added to all four `examples/` directories with `"types": ["node"]` to resolve `Cannot find name 'process'` IDE errors

[1.0.0]: https://github.com/ZeeaanNawazHarall/playwright-best-practices/releases/tag/v1.0.0
