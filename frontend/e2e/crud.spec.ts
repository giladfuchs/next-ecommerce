import { test, expect } from "@playwright/test";
import { TEST_BASE_URL } from "./global-setup";
import { ModelType } from "lib/types";
import {
  assertRowCountIncreasedByOne,
  deleteFirstRowFromModel,
  fillBasicCategoryForm,
  fillBasicProductForm,
  getRowCount,
  loginToAdmin,
  navigateToAdminModel,
  openFirstEditForm,
  submitForm,
} from "./helper-test";

test("view first order details page", async ({ page }) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.order);

  const viewButtons = page.locator('[data-testid="action-view-button"]');
  await expect(viewButtons.first()).toBeVisible();
  await viewButtons.first().click();

  await expect(page).toHaveURL(/\/admin\/order\/\d+$/);
  await expect(page.getByTestId("admin-order-detail")).toBeVisible();
});
test("navigate through admin pages and check tables render", async ({
  page,
}) => {
  await loginToAdmin(page);
  for (const model of Object.values(ModelType)) {
    await navigateToAdminModel(page, model as ModelType);
  }
});

test("delete first product/category", async ({ page }) => {
  await loginToAdmin(page);
  await deleteFirstRowFromModel(page, ModelType.product);
  await deleteFirstRowFromModel(page, ModelType.category);
});

test("edit first category", async ({ page }) => {
  await openFirstEditForm(page, ModelType.category);
  await fillBasicCategoryForm(page);

  await submitForm(page, ModelType.category);
});

test("add category and verify count increase", async ({ page }) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.category);
  const rowCountBefore = await getRowCount(page);
  await page.getByTestId("add-category-button").click();
  await expect(page).toHaveURL(
    `${TEST_BASE_URL}/admin/form/${ModelType.category}/add`,
  );
  await expect(page.getByTestId("form-title")).toBeVisible();

  await fillBasicCategoryForm(page);

  await submitForm(page, ModelType.category);
  await assertRowCountIncreasedByOne(page, rowCountBefore);
});

test("edit first product", async ({ page }) => {
  await openFirstEditForm(page, ModelType.product);

  await fillBasicProductForm(page);
  await submitForm(page, ModelType.product);
});

test("add product and verify count increase", async ({ page }) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.product);
  const rowCountBefore = await getRowCount(page);
  await page.getByTestId("add-product-button").click();
  await expect(page).toHaveURL(
    `${TEST_BASE_URL}/admin/form/${ModelType.product}/add`,
  );

  await fillBasicProductForm(page, { withImage: true });

  await submitForm(page, ModelType.product);
  await assertRowCountIncreasedByOne(page, rowCountBefore);
});

test("show errors when required product fields are missing", async ({
  page,
}) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.product);

  const addButton = page.getByTestId("add-product-button");
  await expect(addButton).toBeVisible();
  await addButton.click();

  await expect(page).toHaveURL(`${TEST_BASE_URL}/admin/form/product/add`);
  const submitButton = page.getByTestId("form-submit-button");

  // Test missing images
  await fillBasicProductForm(page, { withImage: false });
  await submitButton.click();
  await expect(
    page.getByTestId("form-error-message-form.error.required.images"),
  ).toBeVisible();

  // Test missing category
  await fillBasicProductForm(page, { withImage: true });
  await page.getByTestId("form-input-category").locator("input").fill("");
  await submitButton.click();
  await expect(
    page.getByTestId("form-error-message-form.error.required.category_id"),
  ).toBeVisible();
  const requiredFields: Array<
    keyof Omit<
      NonNullable<Parameters<typeof fillBasicProductForm>[1]>,
      "withImage"
    >
  > = ["price", "title", "description"];

  for (const field of requiredFields) {
    await fillBasicProductForm(page, { [field]: "", withImage: true });
    await submitButton.click();
    const errorId = `form-error-message-form.error.required.${field}`;
    await expect(page.getByTestId(errorId)).toBeVisible();
  }
});
test("show error when image has only URL or only altText", async ({ page }) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.product);

  const addButton = page.getByTestId("add-product-button");
  await expect(addButton).toBeVisible();
  await addButton.click();

  await expect(page).toHaveURL(`${TEST_BASE_URL}/admin/form/product/add`);

  // -------- Case 1: Only URL, no altText --------
  await fillBasicProductForm(page, { withImage: false });

  await page.getByTestId("form-toggle-images").click();

  const imageUrl = page
    .getByTestId("form-input-images")
    .locator('input[type="text"]')
    .first();
  await imageUrl.fill("https://example.com/incomplete.jpg");

  const submitButton = page.getByTestId("form-submit-button");
  await submitButton.click();

  await expect(
    page.getByTestId("form-error-message-form.error.required.imageFields"),
  ).toBeVisible();

  // -------- Case 2: Only altText, no URL --------
  await fillBasicProductForm(page, { withImage: false });

  await page.getByTestId("form-toggle-images").click();

  const imageUrl2 = page
    .getByTestId("form-input-images")
    .locator('input[type="text"]')
    .first();
  await imageUrl2.fill("");

  const imageAlt = page
    .getByTestId("form-input-images")
    .locator('input[type="text"]')
    .nth(1);
  await imageAlt.fill("Only alt text");

  await submitButton.click();

  await expect(
    page.getByTestId("form-error-message-form.error.required.imageFields"),
  ).toBeVisible();
});
test("show error when adding category with empty title", async ({ page }) => {
  await loginToAdmin(page);
  await navigateToAdminModel(page, ModelType.category);

  const addButton = page.getByTestId("add-category-button");
  await expect(addButton).toBeVisible();
  await addButton.click();

  await expect(page).toHaveURL(`${TEST_BASE_URL}/admin/form/category/add`);

  const positionInput = page
    .getByTestId("form-input-position")
    .locator("input");
  await positionInput.fill("42");

  const submitButton = page.getByTestId("form-submit-button");
  await submitButton.click();

  await expect(
    page.getByTestId("form-error-message-form.error.required.title"),
  ).toBeVisible();
});
