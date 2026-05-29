/**
 * Anti-patterns #1 and #2: XPath locators and CSS class selectors.
 *
 * Source: https://playwright.dev/docs/best-practices
 * "Prefer user-facing attributes to XPath or CSS selectors."
 */

import { Page } from "@playwright/test";

export class LoginLocatorsBAD {
  constructor(private page: Page) {}

  // ❌ #1 — XPath tied to DOM attribute.
  //    IDs are generated or renamed by React/Angular/Vue. When the id changes,
  //    this locator silently breaks with no indication of what changed.
  usernameField = this.page.locator('//*[@id="user-name"]');

  // ❌ #1 — XPath again. Same fragility.
  passwordField = this.page.locator('//*[@id="password"]');
}

export class LoginLocatorsGOOD {
  constructor(private page: Page) {}

  // ✅ getByTestId targets the explicit testing contract (data-test attribute).
  //    Requires testIdAttribute: 'data-test' in playwright.config.ts.
  usernameField = this.page.getByTestId("username");

  // ✅ Semantic locator — survives DOM restructuring.
  passwordField = this.page.getByTestId("password");
}

// ---------------------------------------------------------------------------

export class ProductLocatorsBAD {
  constructor(private page: Page) {}

  // ❌ #2 — CSS class selector for an interactive element.
  //    A designer can rename .shopping_cart_link to .cart-nav-link without
  //    changing any visible behaviour. The test breaks; the redesign didn't.
  cartIcon = this.page.locator(".shopping_cart_link");
}

export class ProductLocatorsGOOD {
  constructor(private page: Page) {}

  // ✅ data-test attribute — explicit testing contract, no dependency on styling.
  cartIcon = this.page.locator('[data-test="shopping-cart-link"]');
}
