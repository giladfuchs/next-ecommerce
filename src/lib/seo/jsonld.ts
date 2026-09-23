import type { Product, SeoMedia } from "@/lib/core/types/payload-types";

import appConfig from "@/lib/core/config";
import {
  CollectionName,
  type CategoryDetail,
  type FaqItem,
  RoutePath,
  type ProductSinglePage,
  type ResolvedArchiveBlock,
  type ResolvedPage,
} from "@/lib/core/types/types";
import {
  calculateAverageRating,
  extractRichTextText,
  resolveMediaUrl,
} from "@/lib/core/util";

type JsonLdNode = Record<string, unknown>;
type ItemListEntry = { item: JsonLdNode; url: string };

export type JsonLdView =
  | { collection: CollectionName.pages; entity: ResolvedPage; slug: string }
  | {
      collection: CollectionName.products;
      entity: ProductSinglePage;
      slug: string;
    }
  | {
      collection: CollectionName.category;
      entity: CategoryDetail;
      products: Product[];
      slug: string;
    };

const SCHEMA_CONTEXT = "https://schema.org";
const getSiteUrl = () => new URL("/", appConfig.BASE_URL).toString();
const createAbsoluteUrl = (path: string) =>
  new URL(path.replace(/^\/+/, ""), getSiteUrl()).toString();
const getPageUrl = (slug: string) =>
  slug === appConfig.HOME_SLUG
    ? getSiteUrl()
    : createAbsoluteUrl(encodeURIComponent(slug));
const getProductUrl = (slug: string) =>
  createAbsoluteUrl(`${RoutePath.product}/${encodeURIComponent(slug)}`);
const getCategoryUrl = (slug: string) =>
  createAbsoluteUrl(`${RoutePath.category}/${encodeURIComponent(slug)}`);

const createGraph = (...nodes: Array<JsonLdNode | undefined>) => ({
  "@context": SCHEMA_CONTEXT,
  "@graph": nodes.filter((node): node is JsonLdNode => Boolean(node)),
});

const createBreadcrumbs = (
  url: string,
  items: Array<{ name: string; url: string }>,
): JsonLdNode => ({
  "@type": "BreadcrumbList",
  "@id": `${url}#breadcrumbs`,
  itemListElement: [{ name: "Home", url: getSiteUrl() }, ...items].map(
    (item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    }),
  ),
});

const createItemListNode = ({
  dateModified,
  description,
  id,
  items,
  name,
  url,
}: {
  dateModified?: string;
  description?: string | null;
  id: string;
  items: ItemListEntry[];
  name: string;
  url: string;
}): JsonLdNode => ({
  "@type": "ItemList",
  "@id": id,
  name,
  ...(description ? { description } : {}),
  url,
  ...(dateModified ? { dateModified } : {}),
  numberOfItems: items.length,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: entry.url,
    item: entry.item,
  })),
});

const archiveItem = (
  block: ResolvedArchiveBlock,
  model: ResolvedArchiveBlock["items"][number],
) => {
  const isProduct = block.contentType === "products";
  const isCategory = block.contentType === "categories";
  const itemUrl = isProduct
    ? getProductUrl(model.slug)
    : isCategory
      ? getCategoryUrl(model.slug)
      : getPageUrl(model.slug);
  const imageRelation = model.meta?.image;
  const itemImage =
    typeof imageRelation === "object" && imageRelation !== null
      ? resolveMediaUrl(imageRelation, "og")
      : undefined;

  return {
    url: itemUrl,
    item: {
      "@type": isProduct
        ? "Product"
        : isCategory
          ? "CollectionPage"
          : "WebPage",
      "@id": `${itemUrl}#${isProduct ? "product" : "webpage"}`,
      url: itemUrl,
      name: model.meta?.title ?? model.title,
      description: model.meta?.description,
      ...(itemImage ? { image: itemImage } : {}),
    },
  };
};

const createPageJsonLd = (page: ResolvedPage, slug: string) => {
  const isHome = slug === appConfig.HOME_SLUG;
  const url = getPageUrl(slug);
  const image = resolveMediaUrl(page.meta.image as SeoMedia, "og");
  const archiveBlocks = page.layout.filter(
    (block): block is ResolvedArchiveBlock =>
      block.blockType === "archive" && block.items.length > 0,
  );
  const archiveLists = archiveBlocks.map((block, index) =>
    createItemListNode({
      id: `${url}#itemlist${archiveBlocks.length > 1 ? `-${index + 1}` : ""}`,
      items: block.items.map((model) => archiveItem(block, model)),
      name: extractRichTextText(block.introContent) || page.title,
      url,
    }),
  );
  const archiveReferences = archiveLists.map((list) => ({
    "@id": list["@id"],
  }));
  const breadcrumbs = isHome
    ? undefined
    : createBreadcrumbs(url, [{ name: page.meta.title ?? page.title, url }]);

  return createGraph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      name: page.meta.title ?? page.title,
      description: page.meta.description,
      url,
      image,
      dateModified: page.updatedAt,
      inLanguage: appConfig.LOCAL.lang,
      ...(archiveReferences.length
        ? {
            mainEntity:
              archiveReferences.length === 1
                ? archiveReferences[0]
                : archiveReferences,
          }
        : {}),
      ...(breadcrumbs ? { breadcrumb: { "@id": breadcrumbs["@id"] } } : {}),
    },
    ...archiveLists,
    breadcrumbs,
  );
};

const createProductJsonLd = (product: ProductSinglePage, slug: string) => {
  const url = getProductUrl(slug);
  const image = resolveMediaUrl(product.meta.image as SeoMedia, "og");
  const { priceRange, inventory, variants } = product.purchase_section;

  const hasStock =
    variants.length > 0
      ? variants.some((variant) => variant.inventory > 0)
      : inventory > 0;

  const offers =
    priceRange.min !== priceRange.max
      ? {
          "@type": "AggregateOffer",
          "@id": `${url}#offer`,
          url,
          priceCurrency: appConfig.LOCAL.currency,
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
          priceCurrency: appConfig.LOCAL.currency,
          price: priceRange.min,
          availability: hasStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
        };

  const description =
    product.meta?.description ?? extractRichTextText(product.description);

  const reviews = product.reviews ?? [];

  const aggregateRating =
    reviews.length > 0
      ? {
          "@type": "AggregateRating",
          ratingValue: calculateAverageRating(reviews).toFixed(1),
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

  const productNode = {
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.meta?.title ?? product.title,
    description,
    url,
    image,
    dateModified: product.updatedAt,
    brand: {
      "@type": "Brand",
      name: appConfig.SITE_NAME,
    },
    offers,
    ...(aggregateRating && { aggregateRating }),
    ...(review && { review }),
  };
  const breadcrumbs = createBreadcrumbs(url, [
    { name: product.meta?.title ?? product.title, url },
  ]);

  return createGraph(
    productNode,
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: product.meta?.title ?? product.title,
      description,
      image,
      dateModified: product.updatedAt,
      inLanguage: appConfig.LOCAL.lang,
      mainEntity: { "@id": productNode["@id"] },
      breadcrumb: { "@id": breadcrumbs["@id"] },
    },
    breadcrumbs,
  );
};

const createCategoryJsonLd = (
  category: CategoryDetail,
  products: Product[],
  slug: string,
) => {
  const url = getCategoryUrl(slug);
  const description =
    category.meta?.description ?? extractRichTextText(category.description);
  const image = category.meta?.image
    ? resolveMediaUrl(category.meta.image as SeoMedia, "og")
    : undefined;

  const items = products.map((product) => {
    const pUrl = getProductUrl(product.slug);
    return {
      url: pUrl,
      item: {
        "@type": "Product",
        "@id": `${pUrl}#product`,
        name: product.title,
        url: pUrl,
      },
    };
  });
  const breadcrumbs = createBreadcrumbs(url, [
    { name: category.meta?.title ?? category.title, url },
  ]);
  const itemList = createItemListNode({
    id: `${url}#itemlist`,
    items,
    name: category.meta?.title ?? category.title,
    description,
    url,
    dateModified: category.updatedAt,
  });

  return createGraph(
    {
      "@type": "CollectionPage",
      "@id": `${url}#webpage`,
      name: category.meta?.title ?? category.title,
      description,
      image,
      url,
      dateModified: category.updatedAt,
      inLanguage: appConfig.LOCAL.lang,
      hasPart: { "@id": itemList["@id"] },
      breadcrumb: { "@id": breadcrumbs["@id"] },
    },
    itemList,
    breadcrumbs,
  );
};

export const createJsonLdByModel = (view: JsonLdView) => {
  switch (view.collection) {
    case CollectionName.pages:
      return createPageJsonLd(view.entity, view.slug);
    case CollectionName.products:
      return createProductJsonLd(view.entity, view.slug);
    case CollectionName.category:
      return createCategoryJsonLd(view.entity, view.products, view.slug);
    default:
      throw new Error("Unsupported JSON-LD collection");
  }
};

export const generateJsonLdFaq = (faqs: FaqItem[], title: string) => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "FAQPage",
  name: `${title} FAQ`,
  mainEntity: faqs.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});
