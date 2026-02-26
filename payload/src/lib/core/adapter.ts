import type {
  Product,
  Variant,
  Cart,
  Media,
} from "@/lib/core/types/payload-types";
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

  const image = product.gallery![0].image as Media;

  const price = variant?.priceInUSD ?? product.priceInUSD ?? undefined;

  return {
    product,
    variant,
    isVariant: Boolean(variant),
    image,
    price,
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
type PurchaseOption =
  ProductPurchaseSectionData["variants"][number]["options"][number];

export const buildProductPurchaseSectionData = (
  product: Product,
  combined: CombinedVariantData,
): ProductPurchaseSectionData => {
  const base_ans = {
    id: product.id,
    inventory: product.inventory!,
    price: product.priceInUSD!,
    variants: [],
    priceRange: { min: 0, max: 0 },
  };
  if (!combined) {
    return base_ans;
  }

  const variants: ProductPurchaseSectionData["variants"] = combined.variantTypes
    .map((type) => {
      const typeId = String(type.id);

      const options: PurchaseOption[] = combined.options
        .filter((o) => String(o.variantType) === typeId)
        .map((o) => {
          const v = combined.variants.find(
            (x) =>
              x.options && x.options.some((id) => String(id) === String(o.id)),
          );

          if (!v) return null;

          return {
            id: String(v.id),
            label: o.label,
            inventory: v.inventory,
            price: v.priceInUSD,
          };
        })
        .filter((x): x is PurchaseOption => Boolean(x))
        .sort((a, b) => a.price - b.price);

      if (!options.length) return null;

      return {
        typeId,
        typeLabel: type.label,
        options,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const prices = variants
    .flatMap((t) => t.options.map((o) => o.price))
    .sort((a, b) => a - b);

  return {
    ...base_ans,
    variants,
    priceRange: prices.length
      ? { min: prices[0], max: prices[prices.length - 1] }
      : { min: 0, max: 0 },
  };
};
