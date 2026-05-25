# Accessibility Testing

> **Sources**:
> - Playwright accessibility guide: [playwright.dev/docs/accessibility-testing](https://playwright.dev/docs/accessibility-testing)
> - `@axe-core/playwright` package: [github.com/dequelabs/axe-core-npm](https://github.com/dequelabs/axe-core-npm/blob/develop/packages/playwright/README.md)
> - axe-core tag reference: [deque.com/axe/core-documentation](https://www.deque.com/axe/core-documentation/api-documentation/#axe-core-tags)
> - Keyboard input: [playwright.dev/docs/input](https://playwright.dev/docs/input)
>
> Where something goes beyond official documentation, it is labeled as a **note**.

---

## What Automated Testing Can and Cannot Detect

From the [official Playwright docs](https://playwright.dev/docs/accessibility-testing):

> "Automated accessibility tests can detect some common accessibility problems such as missing or invalid properties. But many accessibility problems can only be discovered through manual testing."

Automated tools like axe-core scan the DOM for rule violations — missing `alt` attributes, insufficient color contrast, improper ARIA usage, unlabelled form fields. They produce results quickly and run in CI without human involvement.

They cannot reliably detect:

- Whether a screen reader announces content in a meaningful order
- Whether a keyboard-only user can complete a real task end-to-end
- Whether a component makes sense when read aloud
- Whether color contrast is truly sufficient for a user with a specific visual impairment

Treat automated scanning as a first layer — a way to catch the obvious and regressions. It does not replace manual testing with real assistive technology.

---

## Setup

Install the `@axe-core/playwright` package:

```bash
npm install --save-dev @axe-core/playwright
```

No other installation is needed. axe-core is bundled inside `@axe-core/playwright`.

---

## Basic Scan

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

`AxeBuilder({ page })` accepts a Playwright `Page` object. `.analyze()` injects the axe-core engine into the page, runs the scan, and returns a results object. The `violations` array contains every detected rule failure.

`expect(results.violations).toEqual([])` fails the test if any violation is found, and the Playwright diff output shows the full violation objects.

---

## Scanning for Specific WCAG Standards

Use `.withTags()` to limit the scan to rules that apply to a specific WCAG conformance level.

```typescript
const results = await new AxeBuilder({ page })
  .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
  .analyze();

expect(results.violations).toEqual([]);
```

### Available tags

| Tag | Standard |
|-----|----------|
| `wcag2a` | WCAG 2.0 Level A |
| `wcag2aa` | WCAG 2.0 Level AA |
| `wcag2aaa` | WCAG 2.0 Level AAA |
| `wcag21a` | WCAG 2.1 Level A |
| `wcag21aa` | WCAG 2.1 Level AA |
| `wcag22aa` | WCAG 2.2 Level AA |
| `best-practice` | Common accessibility best practices (not tied to a WCAG level) |
| `section508` | US Section 508 requirements |

Without `.withTags()`, axe-core runs all enabled rules, which includes experimental and best-practice rules that your team may not be targeting. Specifying tags scopes the scan to a defined standard.

**Most common baseline for web applications**: `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`

---

## Targeting a Specific Part of the Page

Use `.include()` to scan only one component or section, instead of the whole page. From the official docs, call `waitFor()` first to ensure the element is in its desired state before scanning.

```typescript
test('navigation menu is accessible', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();

  // Wait for the menu to be in its final state before scanning
  await page.locator('#navigation-menu').waitFor();

  const results = await new AxeBuilder({ page })
    .include('#navigation-menu')
    .analyze();

  expect(results.violations).toEqual([]);
});
```

`.include()` accepts CSS selectors. You can chain multiple calls to include more than one area.

---

## Excluding Elements

Use `.exclude()` to remove a selector from the scan scope.

```typescript
const results = await new AxeBuilder({ page })
  .exclude('#third-party-widget')
  .analyze();
```

From the official docs: excluding an element prevents all rules from running against that element and its descendants. Be specific about what you exclude — a broad exclusion can hide real violations in children of the excluded element.

---

## Targeting Specific Rules

### Run only certain rules

```typescript
const results = await new AxeBuilder({ page })
  .withRules(['image-alt', 'label', 'color-contrast'])
  .analyze();
```

### Disable specific rules

```typescript
const results = await new AxeBuilder({ page })
  .disableRules(['duplicate-id'])
  .analyze();
```

Use `.disableRules()` sparingly — only for rules that are known false positives in your specific setup, and document why.

---

## Attaching Results to the Report

Export the full scan results as a JSON attachment so they appear in the Playwright HTML report and Allure. Useful when investigating which specific elements failed.

```typescript
test('home page accessibility', async ({ page }, testInfo) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  await testInfo.attach('accessibility-scan-results', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  expect(results.violations).toEqual([]);
});
```

The attachment is visible in the test report even when the test passes, so you can review what was scanned regardless of outcome.

---

## Handling Known Violations

When a violation exists but cannot be fixed immediately (third-party content, a tracked ticket), do not use `.disableRules()` globally. Instead, use fingerprinting — assert on a specific, stable identifier for the known violation rather than snapshotting the full object.

From the official docs — create a fingerprint helper:

```typescript
function violationFingerprints(results: Awaited<ReturnType<AxeBuilder['analyze']>>) {
  return results.violations.map(violation => ({
    rule: violation.id,
    targets: violation.nodes.map(node => node.target),
  }));
}
```

Use it in the test:

```typescript
test('page has only known violations', async ({ page }) => {
  await page.goto('/');

  const results = await new AxeBuilder({ page }).analyze();

  expect(violationFingerprints(results)).toMatchSnapshot();
});
```

`toMatchSnapshot()` records the fingerprints on the first run. Subsequent runs fail if new violations appear or existing ones change location. This is more explicit than `toEqual([])` when you are working towards compliance incrementally.

---

## Reusable Fixture

When the same axe configuration should apply across all accessibility tests, centralise it in a fixture rather than repeating it in every test.

```typescript
// fixtures/accessibility.ts
import { test as base } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type AccessibilityFixtures = {
  makeAxeBuilder: () => AxeBuilder;
};

export const test = base.extend<AccessibilityFixtures>({
  makeAxeBuilder: async ({ page }, use) => {
    const makeAxeBuilder = () =>
      new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .exclude('#cookie-banner'); // exclude a known third-party widget

    await use(makeAxeBuilder);
  },
});

export { expect } from '@playwright/test';
```

Tests call `makeAxeBuilder()` and can add further configuration on top:

```typescript
// login.spec.ts
import { test, expect } from '../fixtures/accessibility';

test('login page has no violations', async ({ page, makeAxeBuilder }) => {
  await page.goto('/login');

  const results = await makeAxeBuilder().analyze();

  expect(results.violations).toEqual([]);
});

test('login form with error state has no violations', async ({ page, makeAxeBuilder }) => {
  await page.goto('/login');
  await page.getByRole('button', { name: 'Sign in' }).click(); // trigger validation

  const results = await makeAxeBuilder()
    .include('#login-form') // scope to just the form
    .analyze();

  expect(results.violations).toEqual([]);
});
```

---

## Keyboard Navigation Testing

Automated axe scans cannot verify whether a user can complete a flow using only the keyboard. These tests must be written explicitly.

### Tab order

```typescript
test('login form is keyboard navigable', async ({ page }) => {
  await page.goto('/login');

  // Start from the page body
  await page.locator('body').press('Tab');
  await expect(page.getByLabel('Username')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByLabel('Password')).toBeFocused();

  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeFocused();
});
```

`toBeFocused()` is a Playwright web-first assertion that waits for the element to receive focus.

### Activating controls with keyboard

```typescript
test('can submit form with Enter key', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_sauce');
  await page.getByRole('button', { name: 'Sign in' }).press('Enter');

  await expect(page).toHaveURL(/inventory/);
});

test('can open dropdown with keyboard', async ({ page }) => {
  await page.goto('/products');

  await page.getByRole('combobox', { name: 'Sort by' }).press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(page.getByRole('combobox', { name: 'Sort by' })).toHaveValue('az');
});
```

### Supported key names

From the Playwright keyboard input docs — key names accepted by `.press()`:

| Category | Keys |
|----------|------|
| Navigation | `Tab`, `Enter`, `Escape`, `Space` |
| Arrow | `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` |
| Editing | `Backspace`, `Delete`, `Insert`, `Home`, `End` |
| Paging | `PageUp`, `PageDown` |
| Modifiers | `Shift`, `Control`, `Alt`, `Meta` |
| Function | `F1` – `F12` |

Combine modifier keys with `+`:

```typescript
await page.keyboard.press('Shift+Tab');   // reverse tab
await page.keyboard.press('Control+a');   // select all
await page.keyboard.press('Alt+ArrowDown'); // open dropdown (OS-dependent)
```

### Focus trap testing

Modal dialogs must trap focus — Tab should cycle only within the modal while it is open.

```typescript
test('modal traps focus', async ({ page }) => {
  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Open settings' }).click();

  const modal = page.getByRole('dialog');
  await expect(modal).toBeVisible();

  // Tab through all focusable elements inside the modal
  const focusableElements = modal.getByRole('button').or(modal.getByRole('link'));
  const count = await focusableElements.count();

  for (let i = 0; i < count + 1; i++) {
    await page.keyboard.press('Tab');
  }

  // After cycling through all elements, focus must still be inside the modal
  const focusedElement = page.locator(':focus');
  await expect(modal).toContainElement(focusedElement);
});
```

### Skip link testing

A skip link allows keyboard users to jump past repeated navigation. Test that it appears on focus and navigates correctly.

```typescript
test('skip link is functional', async ({ page }) => {
  await page.goto('/');

  // Skip links are often visually hidden until focused
  await page.locator('body').press('Tab');

  const skipLink = page.getByRole('link', { name: /skip to main content/i });
  await expect(skipLink).toBeFocused();

  await skipLink.press('Enter');

  // Focus should have moved to the main content area
  await expect(page.locator('#main-content')).toBeFocused();
});
```

---

## Organising Accessibility Tests

> **Note** — not from official docs. A structural recommendation based on common team practice.

### Option 1 — Dedicated accessibility spec files

```
tests/
  checkout.spec.ts
  login.spec.ts
  accessibility/
    checkout.a11y.spec.ts
    login.a11y.spec.ts
```

Keeps accessibility tests separate, which makes it easy to run them independently or on a separate CI schedule.

```bash
npx playwright test --grep "@a11y"   # if using test tags
npx playwright test tests/accessibility/
```

### Option 2 — Accessibility assertions inside feature tests

```typescript
test('login page renders correctly', async ({ page, makeAxeBuilder }) => {
  await page.goto('/login');

  // Functional assertion
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  // Accessibility assertion in the same test
  const results = await makeAxeBuilder().analyze();
  expect(results.violations).toEqual([]);
});
```

This keeps the accessibility check close to the feature it covers. The trade-off is that accessibility failures appear mixed with functional failures in the report.

### Adding test tags for filtering

```typescript
test('login is accessible @a11y', async ({ page, makeAxeBuilder }) => {
  // ...
});
```

Run only accessibility tests:

```bash
npx playwright test --grep "@a11y"
```

---

## What Axe-Core Detects Automatically

Common rules axe-core checks under `wcag2a` and `wcag2aa`:

| Rule ID | What it checks |
|---------|---------------|
| `image-alt` | `<img>` elements have a non-empty `alt` attribute |
| `label` | Form inputs have an associated `<label>` |
| `color-contrast` | Text has sufficient contrast ratio against its background |
| `html-lang` | `<html>` has a valid `lang` attribute |
| `link-name` | `<a>` elements have discernible text |
| `button-name` | `<button>` elements have discernible text |
| `duplicate-id` | IDs in the document are unique |
| `aria-required-attr` | Elements with ARIA roles have required attributes |
| `aria-valid-attr` | ARIA attributes are valid |
| `heading-order` | Heading levels (`h1`–`h6`) do not skip levels |
| `keyboard` | All interactive elements are keyboard accessible |

These are examples — axe-core runs many more rules. See the full rule list at [dequeuniversity.com/rules/axe](https://dequeuniversity.com/rules/axe/).

---

## What Automated Testing Does Not Cover

These must be tested manually or with a real screen reader:

- Whether content is announced in a logical reading order
- Whether dynamic content updates (live regions) are announced correctly
- Whether error messages are associated with the input that caused them in a way that is announced
- Whether focus management after a modal opens or closes feels natural
- Whether a page with 100% passing axe rules is actually usable by a screen reader user
