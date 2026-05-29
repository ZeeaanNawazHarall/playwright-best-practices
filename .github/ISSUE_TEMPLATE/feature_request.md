---
name: Feature request
about: Suggest a new pattern, anti-pattern, example framework, or documentation section
title: "[feat] "
labels: enhancement
assignees: ""
---

## What are you proposing?

<!-- One sentence. "Add a doc section on X", "Add anti-pattern #N: Y", "Add a new example framework showing Z", etc. -->

## Why does this belong in this repo?

<!-- This repo documents patterns from official Playwright docs or clearly-labeled Architectural Decisions.
     Which of the following applies? -->

- [ ] This pattern is documented in the [official Playwright docs](https://playwright.dev/docs/best-practices) — link: ___
- [ ] This is an **Architectural Decision** (beyond official docs) — common in real projects but not officially prescribed. Must be clearly labeled as such in the docs.
- [ ] This is a new anti-pattern I've seen cause real problems in production suites

## Detailed description

<!-- Describe the proposed content. For a new pattern: what it is, why it matters, and a code example.
     For a new anti-pattern: before (bad) and after (good) code, plus the official source or reasoning. -->

### Before (if anti-pattern)

```typescript
// ❌ Anti-pattern:
```

### After (recommended)

```typescript
// ✅ Recommended:
```

## Real-world impact (anti-pattern proposals)

<!-- Optional but strongly encouraged. Where did you see this cause problems?
     "This caused intermittent failures in our 200-test suite because..."
     "We saw this on a 5-engineer team when..."
     Concrete context justifies inclusion over other candidates. -->

## Which section would this fit?

- [ ] `docs/01-framework-architecture`
- [ ] `docs/02-fixtures`
- [ ] `docs/03-locators`
- [ ] `docs/04-authentication`
- [ ] `docs/05-configuration`
- [ ] `docs/06-reporting`
- [ ] `docs/07-ci-cd`
- [ ] `docs/08-flaky-tests`
- [ ] `docs/09-accessibility`
- [ ] `docs/10-anti-patterns`
- [ ] New example framework in `examples/`
- [ ] Something else — describe below

## Checklist

- [ ] I searched existing issues and this hasn't been proposed before
- [ ] I can point to an official Playwright source, or I understand this will be labeled as an **Architectural Decision**
