# Locators

> **Source**: All patterns in this section are sourced directly from the [official Playwright locators documentation](https://playwright.dev/docs/locators) and [best practices guide](https://playwright.dev/docs/best-practices). Where something goes beyond what Playwright documents, it is labeled as a **note** or **architectural decision**.

---

## The Priority Order

From the [official best practices guide](https://playwright.dev/docs/best-practices#use-locators):

> "Prefer user-facing attributes to XPath or CSS selectors. Your DOM can easily change so having your tests depend on your DOM structure can lead to failing tests."

The recommended order, highest to lowest preference:

| Priority | Locator | When to use |
|----------|---------|-------------|
| 1 | `getByRole()` | Anything with an ARIA role — buttons, links, headings, checkboxes, inputs |
| 2 | `getByLabel()` | Form inputs associated with a `<label>` |
| 3 | `getByPlaceholder()` | Inputs that have placeholder text but no visible label |
| 4 | `getByText()` | Non-interactive elements identified by their content |
| 5 | `getByAltText()` | Images identified by their alt attribute |
| 6 | `getByTitle()` | Elements with a title attribute |
| 7 | `getByTestId()` | When role/label/text are not viable — requires adding `data-testid` to HTML |
| 8 | `locator('css=...')` | When a semantic locator genuinely cannot identify the element |
| 9 | `locator('xpath=...')` | Last resort only |

A common misconception is that test IDs are the "most correct" choice because they're stable. Playwright's docs clarify: test IDs are the most resilient for test stability, but they are not user-facing. Role and text locators are preferred precisely *because* they reflect what users actually see — and if a button loses its accessible name, that is a real problem worth catching.

---

## `getByRole()`

The most recommended locator. It targets elements using [ARIA roles](https://www.w3.org/TR/html-aria/) — the same attributes used by screen readers and assistive technology.

From the docs: `getByRole()` "reflects how users and assistive technology perceive the page, for example whether some element is a button or a checkbox."

Many HTML elements have implicitly defined roles. You do not need to add `role="button"` to a `<button>` — it already has the `button` role.

```typescript
// Button
await page.getByRole('button', { name: 'Sign in' }).click();

// Heading
await expect(page.getByRole('heading', { name: 'Sign up' })).toBeVisible();

// Checkbox
await page.getByRole('checkbox', { name: 'Subscribe' }).check();

// Case-insensitive match with regex
await page.getByRole('button', { name: /submit/i }).click();
```

### The `name` option

`name` matches the *accessible name* of the element — not the text node alone. For a button, the accessible name is typically its text content. For an input, it is the associated label's text. Always pass `name` to uniquely identify the element when multiple elements share the same role.

### Common roles

| Role | Matches |
|------|---------|
| `button` | `<button>`, `<input type="button">`, `role="button"` |
| `link` | `<a href="...">` |
| `heading` | `<h1>` through `<h6>` |
| `checkbox` | `<input type="checkbox">` |
| `radio` | `<input type="radio">` |
| `textbox` | `<input type="text">`, `<textarea>` |
| `combobox` | `<select>`, custom dropdowns |
| `listitem` | `<li>` |
| `img` | `<img>` |

---

## `getByLabel()`

Locates a form control by the text of its associated `<label>` element.

```typescript
await page.getByLabel('Username').fill('standard_user');
await page.getByLabel('Password').fill('secret_sauce');
```

This works for inputs associated with labels via:
- `<label for="id">` + `<input id="id">`
- `<label><input /></label>` (wrapped label)
- `aria-label` attribute
- `aria-labelledby` attribute

Prefer this over targeting input elements by their `id` or class, because it tests the label-input relationship — a real accessibility concern.

---

## `getByPlaceholder()`

Locates an input by its `placeholder` attribute.

```typescript
await page.getByPlaceholder('Search products...').fill('bike');
```

Use this when an input has a placeholder but no visible `<label>`. If a label exists, prefer `getByLabel()`.

---

## `getByText()`

Locates an element by its text content. By default, partial match.

```typescript
// Partial match (default)
await page.getByText('Thank you for your order').click();

// Exact match
await page.getByText('Thank you for your order!', { exact: true }).click();

// Regex
await page.getByText(/order confirmed/i).click();
```

### When to use and when not to

Use `getByText()` for static content (headings, labels, paragraphs) that users read.

Do not use it for interactive elements like buttons and links — use `getByRole()` there. A `<button>` with text "Add to cart" is better located with `getByRole('button', { name: 'Add to cart' })` because it tests that the element is actually a button, not just any element containing that text.

---

## `getByAltText()`

Locates images and elements by their `alt` attribute.

```typescript
await page.getByAltText('Sauce Labs Backpack').click();
```

---

## `getByTitle()`

Locates elements by their `title` attribute.

```typescript
await expect(page.getByTitle('Issues count')).toHaveText('25 issues');
```

---

## `getByTestId()`

Locates elements by a dedicated test attribute (`data-testid` by default, configurable).

```typescript
await page.getByTestId('login-button').click();
```

From the official docs: "Testing by test ids is the most resilient way of testing as even if your text or role of the attribute changes, the test will still pass. However, this isn't user-facing."

Use test IDs when:
- The element has no meaningful role, label, or stable text
- You are explicitly creating a testing contract with the development team
- Accessibility attributes are not available (third-party components, canvas, etc.)

### Configuring a custom test ID attribute

By default `getByTestId()` targets `data-testid`. If your project uses a different attribute (e.g. `data-test`, `data-qa`, `data-cy`), configure it once in `playwright.config.ts`:

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    testIdAttribute: 'data-test',
  },
});
```

After this, `getByTestId('login-button')` finds `<button data-test="login-button">` instead of `<button data-testid="login-button">`.

This means you can replace:

```typescript
// Before — raw CSS locator
page.locator('[data-test="login-button"]')

// After — semantic, consistent with the configured contract
page.getByTestId('login-button')
```

Both locate the same element. `getByTestId()` is preferred because it makes the testing contract explicit and keeps the attribute name configuration in one place.

---

## CSS Selectors

Accessed via `page.locator('css=...')` or simply `page.locator('...')` (Playwright auto-detects CSS).

```typescript
await page.locator('.shopping_cart_link').click();
await page.locator('[data-test="product-sort-container"]').click();
```

CSS selectors are acceptable when:
- Semantic locators (`getByRole`, `getByLabel`) genuinely cannot uniquely identify the element
- You are targeting by `data-*` attributes (since `getByTestId` handles only the one configured attribute)
- The selector is stable and tied to meaning (e.g. a structural class that will not change)

CSS selectors become brittle when they target implementation details — class names added by CSS frameworks, generated names, or deeply nested paths:

```typescript
// Brittle — class names are implementation details that change with styling
await page.locator('button.buttonIcon.episode-actions-later').click();

// Brittle — depends on exact DOM nesting
await page.locator('div > ul > li:first-child > span > button').click();
```

---

## XPath

Accessed via `page.locator('xpath=...')` or `page.locator('//...')` (Playwright auto-detects XPath when the string starts with `//`).

```typescript
await page.locator('//button[@type="submit"]').click();
await page.locator('xpath=//input[@id="user-name"]').fill('standard_user');
```

XPath is the last resort. From the official docs: "CSS and XPath are not recommended as the DOM can often change leading to non resilient tests."

Common problems with XPath:
- Relies on DOM structure — a wrapping `<div>` added by a developer silently breaks the path
- `id` attributes are often dynamically generated in React, Vue, and Angular apps
- Harder to read than semantic locators
- No benefit over CSS for most use cases — CSS selectors are equally capable and more readable

When you genuinely have no alternative (legacy apps, deeply complex custom components with no ARIA attributes), use the most specific and stable XPath expression available — prefer `[@id="..."]` or `[@data-test="..."]` over positional expressions like `//div[3]/span[2]`.

---

## Filtering Locators

When multiple elements match a locator, narrow the result using `.filter()`.

### Filter by text

```typescript
await page
  .getByRole('listitem')
  .filter({ hasText: 'Product 2' })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

### Filter by not having text

```typescript
await expect(
  page.getByRole('listitem').filter({ hasNotText: 'Out of stock' })
).toHaveCount(5);
```

### Filter by child element

```typescript
await page
  .getByRole('listitem')
  .filter({ has: page.getByRole('heading', { name: 'Product 2' }) })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

### Store a filtered locator and reuse it

```typescript
const product = page
  .getByRole('listitem')
  .filter({ hasText: 'Sauce Labs Bike Light' });

await product.getByRole('button', { name: 'Add to cart' }).click();
await expect(product).toHaveCount(1);
```

---

## Chaining Locators

Chain locators to narrow scope — the second locator searches within the result of the first.

```typescript
// Clicks "Add to cart" only within the "Sauce Labs Backpack" row
await page
  .getByRole('listitem')
  .filter({ hasText: 'Sauce Labs Backpack' })
  .getByRole('button', { name: 'Add to cart' })
  .click();
```

---

## AND and OR Operators

### AND — both conditions must match

```typescript
const button = page
  .getByRole('button')
  .and(page.getByTitle('Subscribe'));
```

### OR — either condition matches (useful for conditional UI)

```typescript
const newEmailButton = page.getByRole('button', { name: 'New email' });
const confirmDialog = page.getByText('Confirm security settings');

// Wait for whichever appears first
await expect(newEmailButton.or(confirmDialog).first()).toBeVisible();
```

---

## Lists

### Assert count

```typescript
await expect(page.getByRole('listitem')).toHaveCount(3);
```

### Assert all text in a list

```typescript
await expect(page.getByRole('listitem')).toHaveText(['apple', 'banana', 'orange']);
```

### Get item by position

```typescript
const secondItem = page.getByRole('listitem').nth(1); // zero-indexed
```

Prefer filtering by text or content over `nth()` — positional selectors break when the list order changes.

### Iterate all items

```typescript
for (const item of await page.getByRole('listitem').all()) {
  console.log(await item.textContent());
}
```

---

## Strictness

Playwright locators enforce strictness by default — if a locator resolves to more than one element when performing a single-element action (like `.click()`), Playwright throws an error.

```typescript
// Throws if there are two buttons with name "Submit" on the page
await page.getByRole('button', { name: 'Submit' }).click();
```

This is intentional — ambiguous locators hide bugs. The fix is to make the locator more specific, not to suppress the error.

```typescript
// Fix: narrow scope first
await page
  .getByRole('form', { name: 'Checkout' })
  .getByRole('button', { name: 'Submit' })
  .click();
```

If you genuinely need to target the first match (e.g. when asserting a count), use `.first()`, `.last()`, or `.nth()`:

```typescript
// Acceptable for assertions on lists
await page.getByRole('listitem').first().click();
```

Avoid `.first()` as a way to silence strictness errors on interactive elements — investigate why the locator is matching multiple elements instead.

---

## Quick Reference

```typescript
// Role (preferred)
page.getByRole('button', { name: 'Add to cart' })
page.getByRole('heading', { name: 'Products' })
page.getByRole('checkbox', { name: 'Subscribe' })

// Form inputs
page.getByLabel('Username')
page.getByPlaceholder('Enter your email')

// Content
page.getByText('Thank you for your order!')

// Images
page.getByAltText('Product thumbnail')

// Test ID (requires data-test or configured attribute in HTML)
page.getByTestId('login-button')

// CSS — when nothing above works
page.locator('[data-test="sort-dropdown"]')

// XPath — last resort
page.locator('//input[@id="user-name"]')
```
