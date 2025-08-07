import { expect, Locator, Page } from "@playwright/test";
import { TEST_BASE_URL } from "./global-setup";
import { ModelType } from "@/lib/types";

// ---shop
export async function fillCheckoutForm(
  page: Page,
  data: {
    name: string;
    email: string;
    phone: string;
    agree: boolean;
  },
) {
  await page.getByTestId("checkout-input-name").fill(data.name);
  await page.getByTestId("checkout-input-email").fill(data.email);
  await page.getByTestId("checkout-input-phone").fill(data.phone);
  if (data.agree) {
    await page.getByTestId("checkout-agree").check();
  }
}

export async function clickFirstAvailableProduct(page: Page) {
  const productCards = page.locator('[data-testid="product-list"] a');
  const count = await productCards.count();

  for (let i = 0; i < count; i++) {
    const productLink = productCards.nth(i);
    await productLink.click();
    await expect(page).toHaveURL(/\/product\//);

    const addToCart = page.getByTestId("add-to-cart-button");
    if (await isAddToCartEnabled(addToCart)) {
      await addToCart.click();
      return;
    }

    await page.goBack();
    await page.waitForSelector('[data-testid="product-list"]');
  }

  throw new Error("❌ No available product found to add to cart");
}

export async function findFirstAvailableProductUrl(
  page: Page,
  startIndex = 0,
): Promise<string> {
  const productLinks = page.locator('[data-testid="product-list"] a');
  const count = await productLinks.count();

  for (let i = startIndex; i < count; i++) {
    const link = productLinks.nth(i);
    const href = await link.getAttribute("href");
    if (!href) continue;

    await link.click();
    await expect(page).toHaveURL(/\/product\//);

    const addToCart = page.getByTestId("add-to-cart-button");
    if (await isAddToCartEnabled(addToCart)) {
      return href;
    }

    await page.goBack();
    await page.waitForSelector('[data-testid="product-list"]');
  }

  throw new Error("❌ No available product found");
}

export async function isAddToCartEnabled(
  button: ReturnType<Page["getByTestId"]>,
) {
  const visible = await button.isVisible().catch(() => false);
  const enabled = await button.isEnabled().catch(() => false);
  return visible && enabled;
}

export async function addProductToCart(
  page: Page,
  productUrl: string,
  closeCart = true,
) {
  const button = page.getByTestId("add-to-cart-button");
  if (await isAddToCartEnabled(button)) {
    await button.click();
    if (closeCart) {
      await page.getByTestId("close-cart-button").click();
    }
  } else {
    throw new Error(`🚫 Add-to-cart not available for ${productUrl}`);
  }
}

export async function checkoutAfterAddingProducts(page: Page) {
  await page.goto(`${TEST_BASE_URL}/`);
  await page.waitForSelector('[data-testid="product-list"]');

  const firstUrl = await findFirstAvailableProductUrl(page);
  await addProductToCart(page, firstUrl, true);

  await page.getByTestId("site-logo").click();
  await page.waitForSelector('[data-testid="product-list"]');

  const secondUrl = await findFirstAvailableProductUrl(page);
  await addProductToCart(page, secondUrl, false);

  await page.waitForSelector("[data-testid='cart']");
  await page.getByTestId("cart-checkout-button").locator("button").click();

  await expect(page).toHaveURL(/\/checkout/);
  await expect(page.getByTestId("checkout-page")).toBeVisible();
}

//--home

export async function gotoHomeAndWait(page: Page) {
  await page.goto(`${TEST_BASE_URL}/`);
  await page.waitForSelector("main");
}

export function getByTestIdsOr(page: Page, ids: string[]): Locator {
  return ids
    .map((id) => page.getByTestId(id))
    .reduce((acc, curr) => acc.or(curr));
}

//--crud

export async function loginToAdmin(page: Page) {
  await page.goto(`${TEST_BASE_URL}/login`);
  const loginButton = page.getByTestId("admin-login-button");
  await expect(loginButton).toBeVisible({ timeout: 10000 });
  await loginButton.click();
  await expect(page).toHaveURL(/\/admin$/);
}

export async function navigateToAdminModel(page: Page, model: ModelType) {
  const navButton = page.getByTestId(`admin-nav-${model}`);
  await navButton.click();
  await expect(page).toHaveURL(new RegExp(`/admin/${model}`));
  await expect(page.getByTestId("ag-table")).toBeVisible({ timeout: 5000 });
}

export async function getRowCount(page: Page): Promise<number> {
  const countText = await page.getByTestId("admin-row-count").textContent();
  return parseInt(countText || "0", 10);
}

export async function assertRowCountIncreasedByOne(
  page: Page,
  previousCount: number,
) {
  const expected = (previousCount + 1).toString();
  await expect(page.getByTestId("admin-row-count")).toHaveText(expected, {
    timeout: 5000,
  });
}

export async function deleteFirstRowFromModel(page: Page, model: ModelType) {
  await navigateToAdminModel(page, model);
  const rowCountBefore = await getRowCount(page);
  const deleteButtons = page.locator('[data-testid="action-delete-button"]');
  await expect(deleteButtons.first()).toBeVisible();
  await deleteButtons.first().click();
  await page.getByTestId("confirm-delete-button").click();
  await page.waitForLoadState("networkidle");

  const maxAttempts = 10;
  const intervalMs = 200;

  for (let i = 0; i < maxAttempts; i++) {
    const rowCountAfter = await getRowCount(page);
    if (rowCountAfter === rowCountBefore - 1) {
      return;
    }
    await page.waitForTimeout(intervalMs);
  }

  throw new Error("Row count did not decrease after deletion");
}
export async function openFirstEditForm(page: Page, model: ModelType) {
  await loginToAdmin(page);
  await navigateToAdminModel(page, model);
  const editButtons = page.locator('[data-testid="action-edit-button"]');
  await expect(editButtons.first()).toBeVisible();
  await editButtons.first().click();
  await expect(page.getByTestId("form-title")).toBeVisible();
}

export async function submitForm(page: Page, model: ModelType) {
  const submitButton = page.getByTestId("form-submit-button");
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  await expect(page).toHaveURL(`${TEST_BASE_URL}/admin/${model}`);
}

export async function fillBasicProductForm(
  page: Page,
  options?: Partial<{
    title: string;
    price: string;
    description: string;
    category: string;
    withImage: boolean;
  }>,
) {
  const title = options?.title ?? `product ${Date.now()}`;
  const price = options?.price ?? (Math.random() * 100).toFixed(2);
  const description = options?.description ?? `description ${Date.now()}`;

  await page.getByTestId("form-input-title").locator("input").fill(title);
  await page.getByTestId("form-input-price").locator("input").fill(price);
  await page
    .getByTestId("form-input-description")
    .locator("textarea")
    .first()
    .fill(description);

  const catInput = page.getByTestId("form-input-category").locator("input");
  await catInput.click();
  await catInput.type(" ");
  await page.waitForSelector('[role="option"]');
  await page.locator('[role="option"]').first().click();

  const checkbox = page
    .getByTestId("form-input-available")
    .locator('input[type="checkbox"]')
    .first();
  const checked = await checkbox.isChecked();
  await checkbox.setChecked(!checked);

  if (options?.withImage) {
    await page.getByTestId("form-toggle-images").click();
    const imageUrl = page
      .getByTestId("form-input-images")
      .locator('input[type="text"]')
      .first();
    await imageUrl.fill("https://example.com/test.jpg");
    const imageAlt = page
      .getByTestId("form-input-images")
      .locator('input[type="text"]')
      .nth(1);
    await imageAlt.fill("Test image");
  }
}

export async function fillBasicCategoryForm(page: Page) {
  const title = `category ${Date.now()}`;
  const pos = Math.floor(Math.random() * 101);

  await page.getByTestId("form-input-title").locator("input").fill(title);
  await page
    .getByTestId("form-input-position")
    .locator("input")
    .fill(pos.toString());
}
