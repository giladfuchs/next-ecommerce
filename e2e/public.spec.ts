import { test, expect } from "@playwright/test";
import { getByTestIdsOr, gotoHomeAndWait } from "./helper-test";

test("homepage renders category list and product grid", async ({ page }) => {
  await gotoHomeAndWait(page);

  const mainContent = getByTestIdsOr(page, ["product-list", "no-products"]);
  await expect(mainContent).toBeVisible({ timeout: 10000 });

  await expect(page.getByTestId("category-nav")).toBeVisible();
  await expect(page.locator("img").first()).toBeVisible();
});

test("navigate to second visible category and verify product list or fallback", async ({
  page,
}) => {
  await gotoHomeAndWait(page);

  const categoryLinks = page.getByTestId("category-link");
  await expect(categoryLinks.first()).toBeVisible();
  await categoryLinks.nth(1).click();
  await page.waitForLoadState("networkidle");

  const result = getByTestIdsOr(page, ["product-list", "no-products"]);
  await expect(result).toBeVisible({ timeout: 5000 });
});

test("navigate to product page from grid and verify title matches", async ({
  page,
}) => {
  await gotoHomeAndWait(page);

  const productList = page.getByTestId("product-list");
  await productList.first().waitFor({ state: "visible", timeout: 7000 });

  const firstCardTitle = productList.getByTestId("product-card-title").first();
  const expectedTitle = (await firstCardTitle.textContent())?.trim() || "";

  await productList.locator("a").first().click();
  await page.waitForLoadState("networkidle");

  const productTitle = page.getByTestId("product-title");
  await expect(productTitle).toBeVisible({ timeout: 7000 });
  await expect(productTitle).toHaveText(expectedTitle);
});
