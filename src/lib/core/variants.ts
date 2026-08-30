import type { ProductPurchaseSectionData } from "@/lib/core/types/types";

export type PurchaseVariant = ProductPurchaseSectionData["variants"][number];
export type PurchaseVariantType =
  ProductPurchaseSectionData["variantTypes"][number];
export type PurchaseVariantOption = PurchaseVariantType["options"][number];
export type VariantOptionState = "available" | "soldOut" | "unavailable";

export const getSelectedPurchaseVariant = (
  product: ProductPurchaseSectionData,
  variantID?: string | null,
): PurchaseVariant | null =>
  product.variants.find((variant) => variant.id === variantID) ??
  // product.variants.find((variant) => variant.inventory > 0) ??
  // product.variants[0] ??
  // product.variants.at(-1) ??

  null;

export const getSelectedOption = (
  type: PurchaseVariantType,
  variant: PurchaseVariant | null,
) =>
  type.options.find((option) => variant?.optionIds.includes(option.id)) ?? null;

const selectedOptionIDsBefore = (
  product: ProductPurchaseSectionData,
  selectedVariant: PurchaseVariant | null,
  typeIndex: number,
) =>
  product.variantTypes
    .slice(0, typeIndex)
    .map((type) => getSelectedOption(type, selectedVariant)?.id)
    .filter((id): id is string => Boolean(id));

export const getVariantOptionState = (
  product: ProductPurchaseSectionData,
  selectedVariant: PurchaseVariant | null,
  typeIndex: number,
  optionID: string,
): VariantOptionState => {
  const requiredPrevious = selectedOptionIDsBefore(
    product,
    selectedVariant,
    typeIndex,
  );
  const matchingVariants = product.variants.filter(
    (variant) =>
      variant.optionIds.includes(optionID) &&
      requiredPrevious.every((id) => variant.optionIds.includes(id)),
  );

  if (matchingVariants.some((variant) => variant.inventory > 0)) {
    return "available";
  }

  return matchingVariants.length > 0 ? "soldOut" : "unavailable";
};

export const isVariantOptionAvailable = (
  product: ProductPurchaseSectionData,
  selectedVariant: PurchaseVariant | null,
  typeIndex: number,
  optionID: string,
) =>
  getVariantOptionState(product, selectedVariant, typeIndex, optionID) ===
  "available";

export const findVariantForOption = (
  product: ProductPurchaseSectionData,
  selectedVariant: PurchaseVariant | null,
  typeIndex: number,
  optionID: string,
): PurchaseVariant | null => {
  const requiredPrevious = selectedOptionIDsBefore(
    product,
    selectedVariant,
    typeIndex,
  );
  const currentOptionIDs = new Set(selectedVariant?.optionIds ?? []);

  return (
    product.variants
      .filter(
        (variant) =>
          variant.optionIds.includes(optionID) &&
          requiredPrevious.every((id) => variant.optionIds.includes(id)),
      )
      .sort((a, b) => {
        const score = (variant: PurchaseVariant) =>
          variant.optionIds.reduce(
            (total, id) => total + (currentOptionIDs.has(id) ? 1 : 0),
            0,
          );

        const scoreDifference = score(b) - score(a);
        if (scoreDifference !== 0) return scoreDifference;

        return Number(b.inventory > 0) - Number(a.inventory > 0);
      })[0] ?? null
  );
};

export const getOptionSwatch = (option: PurchaseVariantOption) => {
  if (option.swatch?.trim()) return option.swatch.trim();

  const value = option.value.trim();
  if (
    value.startsWith("#") ||
    /^(rgb|hsl|oklch|linear-gradient|radial-gradient)\(/i.test(value) ||
    /^[a-z]+$/i.test(value)
  ) {
    return value;
  }

  return "#d1d5db";
};
