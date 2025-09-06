import { Category, ModelType, Product } from "@/lib/types";
import { baseUrl } from "@/lib/config";

export const generateJsonLdProduct = (product: Product) => {
  const url = `${baseUrl}/${ModelType.product}/${encodeURIComponent(product.handle)}`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description: product.description,
    url,
    image: product.images.map((img) => img.url),
    category: product.category,
    dateModified: product.updatedAt,
    offers: {
      "@type": "Offer",
      "@id": `${url}#offer`,
      url,
      price: product.price,
      priceCurrency: "ILS",
      availability: product.available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
};

export const generateJsonLdItemListCategory = (
  category: Category,
  products: Product[],
) => {
  const url = `${baseUrl}/${ModelType.category}/${encodeURIComponent(category.handle)}`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name: category.title,
    url,
    dateModified: category.updatedAt,
    numberOfItems: products.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: products.map((product, index) => {
      const pUrl = `${baseUrl}/${ModelType.product}/${encodeURIComponent(product.handle)}`;
      return {
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          "@id": `${pUrl}#product`,
          name: product.title,
          url: pUrl,
        },
      };
    }),
  };
};

export const generateJsonLdBreadcrumbsCategory = (category: Category) => {
  const url = `${baseUrl}/${ModelType.category}/${encodeURIComponent(category.handle)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${baseUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: category.title,
        item: url,
      },
    ],
  };
};
