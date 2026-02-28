import type {
  Category,
  Media,
  Product,
  SiteSetting,
} from "@/lib/core/types/payload-types";

import appConfig from "@/lib/core/config";
import { RoutePath, ProductSinglePage } from "@/lib/core/types/types";
import { extractRichTextText } from "@/lib/core/util";

export const generateJsonLdProduct = (
  product: ProductSinglePage,
  slug: string,
) => {
  const url = `${appConfig.BASE_URL}/${RoutePath.product}/${encodeURIComponent(slug)}`;
  const image = `${appConfig.SERVER_URL}${(product.gallery![0].image as Media).url}`;
  const { priceRange, inventory, variants } = product.purchase_section;

  const hasStock =
    variants.length > 0
      ? variants.some((t) => t.options.some((o) => o.inventory > 0))
      : inventory > 0;

  const offers =
    priceRange.min !== priceRange.max
      ? {
          "@type": "AggregateOffer",
          "@id": `${url}#offer`,
          url,
          priceCurrency: "USD",
          lowPrice: priceRange.min,
          highPrice: priceRange.max,
          availability: hasStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        }
      : {
          "@type": "Offer",
          "@id": `${url}#offer`,
          url,
          priceCurrency: "USD",
          price: priceRange.min,
          availability: hasStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        };

  const description = extractRichTextText(product.description);

  const reviews = product.reviews ?? [];

  const aggregateRating =
    reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: (
            reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          ).toFixed(1),
          reviewCount: reviews.length,
        }
      : undefined;

  const review =
    reviews.length > 0
      ? reviews.map((r) => ({
          "@type": "Review",
          "@id": `${url}#review-${r.id}`,
          author: {
            "@type": "Person",
            name: r.authorName,
          },
          datePublished: r.createdAt,
          reviewBody: r.body,
          reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
            worstRating: "1",
          },
        }))
      : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.title,
    description,
    url,
    image,
    dateModified: product.updatedAt,
    offers,
    ...(aggregateRating && { aggregateRating }),
    ...(review && { review }),
  };
};
export const generateJsonLdItemListCategory = (
  category: Category,
  products: Product[],
) => {
  const url = `${appConfig.BASE_URL}/${RoutePath.category}/${encodeURIComponent(category.slug)}`;
  const description = extractRichTextText(category.description);

  const itemListElement = products.map((product, index) => {
    const pUrl = `${appConfig.BASE_URL}/${RoutePath.product}/${encodeURIComponent(product.slug)}`;
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
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#itemlist`,
    name: category.title,
    description,
    url,
    dateModified: category.updatedAt,
    numberOfItems: products.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement,
  };
};

export const generateJsonLdBreadcrumbsCategory = (category: Category) => {
  const url = `${appConfig.BASE_URL}/${RoutePath.category}/${encodeURIComponent(category.slug)}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: `${appConfig.BASE_URL}/`,
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

export const generateJsonLdHome = (settings: SiteSetting) => {
  const url = appConfig.BASE_URL;
  const description = extractRichTextText(settings.home.description);
  const image = settings.home.image_meta as Media;

  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${url}#website`,
      name: settings.home.title,
      url,
      description,
      inLanguage: "en",
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": `${url}#organization`,
      name: settings.home.title,
      url,
      logo: `${appConfig.SERVER_URL}${image.url}`,
    },
  ];
};
