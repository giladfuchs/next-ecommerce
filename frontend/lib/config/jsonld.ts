import { Category, Product } from "@/lib/types";
import { baseUrl } from "@/lib/config";

export const generateJsonLdProduct = (product: Product) => ({
  "@context": "https://schema.org",
  "@type": "Product",
  name: product.title,
  description: product.description,
  image: product.featuredImage.url,
  offers: {
    "@type": "AggregateOffer",
    price: product.price,
    priceCurrency: "ILS",
    availability: product.available
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    offerCount: 1,
    highPrice: product.price,
    lowPrice: product.price,
  },
});
export const generateJsonLdCategory = (
  category: Category,
  products: Product[],
) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: category.title,
  itemListElement: products.map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: `${baseUrl}/product/${product.handle}`,
    name: product.title,
  })),
});
