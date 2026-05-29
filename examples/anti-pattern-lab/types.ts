/**
 * Anti-pattern #6: page: any instead of page: Page.
 *
 * Using any silences TypeScript across everything that flows from that
 * parameter — renamed methods, wrong argument counts, and broken imports
 * all pass compilation without error.
 */

import { Page } from "@playwright/test";
import { ProductsPage } from "../pom-framework/pages/product/product.actions";
import { CartPage } from "../pom-framework/pages/cart/cart.actions";

// ❌ All three page objects are typed as 'any'. TypeScript cannot check them.
//    If ProductsPage.addItemToCart() is renamed, this compiles — and blows
//    up at runtime.
const getPagesBad = (page: any) => ({
  product: new ProductsPage(page),
  cart: new CartPage(page),
});

// ✅ One import and one type annotation restores full safety.
//    Renaming, wrong arity, or missing methods are caught at compile time.
const getPagesGood = (page: Page) => ({
  product: new ProductsPage(page),
  cart: new CartPage(page),
});

// ---------------------------------------------------------------------------
// The same issue appears in helper function signatures.

// ❌ All the type safety in the helper is gone.
const cartBadgeCountBad = async (page: any) => {
  const badge = page.locator('[data-test="shopping-cart-badge"]');
  if ((await badge.count()) === 0) return 0;
  return Number((await badge.innerText()).trim()) || 0;
};

// ✅ page: Page — TypeScript checks every locator and method call.
const cartBadgeCountGood = async (page: Page) => {
  const badge = page.locator('[data-test="shopping-cart-badge"]');
  if ((await badge.count()) === 0) return 0;
  return Number((await badge.innerText()).trim()) || 0;
};
