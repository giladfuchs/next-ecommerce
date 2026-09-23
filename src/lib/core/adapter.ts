import type { Product, Variant, Cart } from "@/lib/core/types/payload-types";
import type {
  ProductPurchaseSectionData,
  CartItem,
  CombinedVariantData,
} from "@/lib/core/types/types";

export const getCartQuantity = (
  cart: Cart | null | undefined,
): number | undefined => {
  if (!cart?.items?.length) return undefined;
  return cart.items.reduce((sum, it) => sum + Number(it?.quantity ?? 0), 0);
};
const getCartItemData = (item: CartItem) => {
  const product = item.product as Product;
  if (!product) return null;

  const variant =
    typeof item?.variant === "object" ? (item.variant as Variant) : null;
  console.log(variant);
  const pricing = getProductPricing(product, variant);

  return {
    product,
    variant,
    isVariant: Boolean(variant),
    ...pricing,
  };
};
type CartRow = {
  item: CartItem;
  data: NonNullable<ReturnType<typeof getCartItemData>>;
};

export const buildCartRows = (cart: Cart | null | undefined): CartRow[] => {
  if (!cart?.items || !Array.isArray(cart.items)) return [];

  return (cart.items as CartItem[]).reduce<CartRow[]>((acc, item) => {
    const data = getCartItemData(item);
    if (data) acc.push({ item, data });
    return acc;
  }, []);
};
type PriceVariant = Pick<
  Variant,
  "priceInUSD" | "priceInUSDEnabled" | "originalPriceInUSD"
>;
type PricedProduct = Pick<Product, "priceInUSD" | "originalPriceInUSD">;

export const getEffectiveVariantPrice = (
  productPrice: number | null | undefined,
  variant: PriceVariant,
) =>
  variant.priceInUSDEnabled && typeof variant.priceInUSD === "number"
    ? variant.priceInUSD
    : productPrice;

export const getProductPricing = (
  product: PricedProduct,
  variant?: PriceVariant | null,
) => {
  const usesCustomPrice =
    Boolean(variant?.priceInUSDEnabled) &&
    typeof variant?.priceInUSD === "number";
  const effectivePrice = variant
    ? getEffectiveVariantPrice(product.priceInUSD, variant)
    : product.priceInUSD;
  const price = typeof effectivePrice === "number" ? effectivePrice : undefined;
  const possibleOriginalPrice =
    variant?.originalPriceInUSD ??
    (usesCustomPrice ? undefined : product.originalPriceInUSD);
  const originalPrice =
    typeof price === "number" &&
    typeof possibleOriginalPrice === "number" &&
    possibleOriginalPrice > price
      ? possibleOriginalPrice
      : undefined;

  return {
    price,
    originalPrice,
    discountPercent:
      originalPrice === undefined || price === undefined
        ? null
        : Math.round(((originalPrice - price) / originalPrice) * 100),
  };
};

const relationID = (value: number | { id: number }) =>
  String(typeof value === "object" ? value.id : value);

export const buildProductPurchaseSectionData = (
  product: Pick<
    Product,
    "id" | "priceInUSD" | "inventory" | "originalPriceInUSD" | "variantTypes"
  >,
  combined: CombinedVariantData,
): ProductPurchaseSectionData => {
  const productPrice = Number(product.priceInUSD ?? 0);
  const base_ans = {
    id: product.id,
    inventory: Number(product.inventory ?? 0),
    price: productPrice,
    originalPrice: product.originalPriceInUSD ?? undefined,
    variants: [],
    variantTypes: [],
    priceRange: { min: productPrice, max: productPrice },
  };
  if (!combined) {
    return base_ans;
  }

  const typeOrder = new Map(
    (product.variantTypes ?? []).map((type, index) => [
      relationID(type),
      index,
    ]),
  );

  const variantTypes: ProductPurchaseSectionData["variantTypes"] =
    combined.variantTypes
      .map((type) => ({
        typeId: String(type.id),
        typeLabel: type.label,
        selectorStyle: type.selectorStyle,
        options: combined.options
          .filter((option) => String(option.variantType) === String(type.id))
          .sort((a, b) =>
            String(a._variantOptions_options_order ?? "").localeCompare(
              String(b._variantOptions_options_order ?? ""),
            ),
          )
          .map((option) => ({
            id: String(option.id),
            label: option.label,
            value: option.value,
            swatch: option.swatch ?? undefined,
          })),
      }))
      .filter((type) => type.options.length > 0)
      .sort(
        (a, b) =>
          (typeOrder.get(String(a.typeId)) ?? Number.MAX_SAFE_INTEGER) -
          (typeOrder.get(String(b.typeId)) ?? Number.MAX_SAFE_INTEGER),
      );

  const optionIDs = new Set(
    variantTypes.flatMap((type) => type.options.map((option) => option.id)),
  );
  const variants: ProductPurchaseSectionData["variants"] = combined.variants
    .map((variant) => {
      const usesCustomPrice =
        Boolean(variant.priceInUSDEnabled) &&
        typeof variant.priceInUSD === "number";

      return {
        id: String(variant.id),
        optionIds: (variant.options ?? [])
          .map(String)
          .filter((id) => optionIDs.has(id)),
        inventory: Number(variant.inventory ?? 0),
        price: usesCustomPrice ? Number(variant.priceInUSD) : productPrice,
        originalPrice:
          variant.originalPriceInUSD ??
          (usesCustomPrice ? undefined : product.originalPriceInUSD) ??
          undefined,
      };
    })
    .filter(
      (variant) =>
        variant.optionIds.length > 0 &&
        variantTypes.every((type) =>
          type.options.some((option) => variant.optionIds.includes(option.id)),
        ),
    );

  const prices = variants.map((variant) => variant.price).sort((a, b) => a - b);

  return {
    ...base_ans,
    variants,
    variantTypes,
    priceRange: prices.length
      ? { min: prices[0], max: prices[prices.length - 1] }
      : { min: 0, max: 0 },
  };
};
