import { test, expect } from "../../fixtures/auth";
import { InventoryPage } from "../../pages/InventoryPage";

test("Should sort products A-Z", async ({ loggedInPage }) => {
  const inventory = new InventoryPage(loggedInPage);

  await inventory.sortBy("az");
  const names = await inventory.getProductNames();

  const sorted = [...names].sort();
  expect(names).toEqual(sorted);
});

test("Should sort products Z-A", async ({ loggedInPage }) => {
  const inventory = new InventoryPage(loggedInPage);

  await inventory.sortBy("za");
  const names = await inventory.getProductNames();

  const sorted = [...names].sort().reverse();
  expect(names).toEqual(sorted);
});

test("Should sort products low to high price", async ({ loggedInPage }) => {
  const inventory = new InventoryPage(loggedInPage);

  await inventory.sortBy("lohi");
  const priceTexts = await loggedInPage
    .getByTestId("inventory-item-price")
    .allInnerTexts();
  const prices = priceTexts.map((t) => Number(t.replace(/[^0-9.]/g, "")));

  expect(prices).toEqual([...prices].sort((a, b) => a - b));
});
