---
name: Bug report
about: Report incorrect documentation, broken code examples, or failing tests
title: "[bug] "
labels: bug
assignees: ""
---

## What's wrong?

<!-- Describe the problem clearly. Is it wrong documentation, code that doesn't compile, a test that fails, or a pattern that causes an error? -->

## Where is it?

<!-- Provide the exact file path and line number, or a link to the section in the docs. -->

**File / section:**

## Expected behaviour

<!-- What should the documentation say, or what should the code do? -->

## Actual behaviour

<!-- What does it currently say or do? Paste output, error messages, or screenshots. -->

## Steps to reproduce

<!-- Required if a test is failing. Provide the exact commands and test file. -->

```bash
cd examples/pom-framework    # or script-framework / simple-pom-framework
npm ci
npx playwright test login.spec.ts
# Observe failure at line X
```

**Playwright report / trace:**
<!-- If a test failed, please attach the HTML report or trace file from your local run or CI artifact download. -->
<!-- Local: npx playwright show-report -->
<!-- CI: download the "playwright-report-*" artifact from the GitHub Actions run. -->

## Environment

<!-- Required only if the issue is with runnable code (pom-framework, script-framework, simple-pom-framework). -->

- OS:
- Node.js version (`node -v`):
- Playwright version (`npx playwright --version`):
- Framework: <!-- pom-framework / script-framework / simple-pom-framework / docs only -->

## Official source (if applicable)

<!-- If the documentation contradicts the official Playwright docs, link to the relevant page:
     https://playwright.dev/docs/best-practices
     https://playwright.dev/docs/pom
     etc. -->

## Checklist

- [ ] I searched existing issues and this has not been reported before
- [ ] I can reproduce this with the latest version of the repo
