import { test, expect } from "@playwright/test";
import { TEST_BASE_URL } from "./global-setup";
import {
  checkoutAfterAddingProducts,
  clickFirstAvailableProduct,
  fillCheckoutForm,
} from "./helper-test";

test("add product to cart and update quantity", async ({ page }) => {
  await page.goto(`${TEST_BASE_URL}/`);
  await page.waitForSelector('[data-testid="product-list"]');

  await clickFirstAvailableProduct(page);

  const cart = page.locator("[data-testid='cart']");
  await expect(cart).toBeVisible();

  const plus = page.getByTestId("cart-qty-plus");
  const minus = page.getByTestId("cart-qty-minus");
  const qty = page.getByTestId("cart-item-qty");

  await plus.click();
  await page.waitForTimeout(50);

  await expect(page.getByTestId("cart-qty-plus")).toBeVisible();
  await page.getByTestId("cart-qty-plus").click();

  await minus.click();

  await expect(qty).toHaveText("2", { timeout: 2000 });
});
test("complete checkout after adding products", async ({ page }) => {
  await checkoutAfterAddingProducts(page);

  await fillCheckoutForm(page, {
    name: "name",
    email: "name@example.com",
    phone: "0520000000",
    agree: true,
  });

  await page.getByTestId("checkout-submit").click();
  await expect(page.getByTestId("checkout-success")).toBeVisible();
});

test("show validation errors when required checkout fields are missing", async ({
  page,
}) => {
  await checkoutAfterAddingProducts(page);
  await page.getByTestId("checkout-submit").click();

  await expect(page.getByTestId("checkout-error-name")).toBeVisible();
  await expect(page.getByTestId("checkout-error-email")).toBeVisible();
  await expect(page.getByTestId("checkout-error-phone")).toBeVisible();
  await expect(page.getByTestId("checkout-error-agreed")).toBeVisible();
});
