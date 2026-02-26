import type {
  Product,
  Variant,
  VariantOption,
  VariantType,
  Cart,
  Media,
} from "@/lib/core/types/payload-types";
import type {
  ProductPurchaseSectionData,
  CartItem,
} from "@/lib/core/types/types";

export const getCartQuantity = (
  cart: Cart | null | undefined,
): number | undefined => {
  if (!cart?.items?.length) return undefined;
  return cart.items.reduce((sum, it) => sum + Number(it?.quantity ?? 0), 0);
};
const getCartItemData = (item: CartItem) => {
  const product =item.product as Product
  if (!product) return null;

  const variant =
    typeof item?.variant === "object" ? (item.variant as Variant) : null;

  const image = product.gallery![0].image as Media

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
): ProductPurchaseSectionData => {
  const variants_product = (product.variants?.docs || []).filter(
    (v): v is Variant => Boolean(v) && typeof v === "object",
  );

  const variantTypes = (product.variantTypes || []).filter(
    (t): t is VariantType => Boolean(t) && typeof t === "object",
  );

  const variants: ProductPurchaseSectionData["variants"] = variantTypes
    .map((type) => {
      const options = (type.options?.docs || []).filter(
        (o): o is VariantOption => Boolean(o) && typeof o === "object",
      );

      const mappedOptions: PurchaseOption[] = options
        .map((option) => {
          const optionId = String(option.id);

          const matchingVariant = variants_product.find((variant) => {
            return (
              Array.isArray(variant.options) &&
              variant.options.some((opt) => {
                const id = typeof opt === "object" ? opt.id : opt;
                return String(id) === optionId;
              })
            );
          });

          if (!matchingVariant) return null;

          return {
            id: String(matchingVariant.id),
            label: option.label,
            inventory: matchingVariant.inventory,
            price: matchingVariant.priceInUSD,
          };
        })
        .filter((x): x is PurchaseOption => Boolean(x))
        .sort((a, b) => a.price - b.price);

      if (!mappedOptions.length) return [];

      return [
        {
          typeId: type.id,
          typeLabel: type.label,
          options: mappedOptions,
        },
      ];
    })
    .flat();

  const prices = variants
    .flatMap((t) => t.options.map((o) => o.price))
    .sort((a, b) => a - b);

  return {
    id: product.id,
    inventory: Number(product.inventory ?? 0),
    price: Number(product.priceInUSD ?? 0),
    variants,
    priceRange: prices.length
      ? { min: prices[0], max: prices[prices.length - 1] }
      : { min: 0, max: 0 },
  };
};
