import { expect } from "@playwright/test";

import { TestModelType, TEST_BASE_URL } from "@/playwright.config";

import type { Locator, Page } from "@playwright/test";

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
      await addToCart.evaluate((el: HTMLButtonElement) => el.click());
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
  const addToCart = page.getByTestId("add-to-cart-button");
  if (await isAddToCartEnabled(addToCart)) {
    await addToCart.evaluate((el: HTMLButtonElement) => el.click());

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
  await expect(page).toHaveURL(/\/admin(\/|$)/);
}

export async function navigateToAdminModel(page: Page, model: TestModelType) {
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

export async function deleteFirstRowFromModel(
  page: Page,
  model: TestModelType,
) {
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
export async function openFirstEditForm(page: Page, model: TestModelType) {
  await loginToAdmin(page);
  await navigateToAdminModel(page, model);
  const editButtons = page.locator('[data-testid="action-edit-button"]');
  await expect(editButtons.first()).toBeVisible();
  await editButtons.first().click();
  await expect(page.getByTestId("form-title")).toBeVisible();
}

export async function submitForm(page: Page, model: TestModelType) {
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

  const fillStable = async (locator: ReturnType<Page["getByTestId"]>) => {
    const input = locator.locator("input, textarea").first();
    await input.click();
    await input.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
    await input.press("Backspace");
    return input;
  };

  const titleInput = await fillStable(page.getByTestId("form-input-title"));
  await titleInput.type(title, { delay: 15 });

  const priceInput = await fillStable(page.getByTestId("form-input-price"));
  await priceInput.type(price, { delay: 15 });

  const descInput = page
    .getByTestId("form-input-description")
    .locator("textarea")
    .first();
  await descInput.click();
  await descInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await descInput.press("Backspace");
  await descInput.type(description, { delay: 10 });

  const catInput = page.getByTestId("form-input-category").locator("input");
  await catInput.click();
  await catInput.type(" ", { delay: 20 });
  await page.getByRole("option").first().click();

  const checkbox = page
    .getByTestId("form-input-available")
    .locator('input[type="checkbox"]')
    .first();
  await checkbox.setChecked(!(await checkbox.isChecked()));

  if (options?.withImage) {
    await page.getByTestId("form-toggle-images").click();

    const imageUrl = page
      .getByTestId("form-input-images")
      .locator('input[type="text"]')
      .first();
    await imageUrl.click();
    await imageUrl.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await imageUrl.press("Backspace");
    await imageUrl.type("https://example.com/test.jpg", { delay: 15 });

    const imageAlt = page
      .getByTestId("form-input-images")
      .locator('input[type="text"]')
      .nth(1);
    await imageAlt.click();
    await imageAlt.press(
      process.platform === "darwin" ? "Meta+A" : "Control+A",
    );
    await imageAlt.press("Backspace");
    await imageAlt.type("Test image", { delay: 15 });
  }
}

export async function fillBasicCategoryForm(page: Page) {
  const title = `category ${Date.now()}`;
  const pos = Math.floor(Math.random() * 101);

  const titleInput = page.getByTestId("form-input-title").locator("input");
  await titleInput.click();
  await titleInput.press(
    process.platform === "darwin" ? "Meta+A" : "Control+A",
  );
  await titleInput.press("Backspace");
  await titleInput.type(title, { delay: 15 });

  const posInput = page.getByTestId("form-input-position").locator("input");
  await posInput.click();
  await posInput.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
  await posInput.press("Backspace");
  await posInput.type(pos.toString(), { delay: 15 });
}
