import { baseUrl } from "lib/config/config";
import { getCategories, getProducts } from "lib/api";
import { ModelType } from "lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts(),
  ]);

  const staticRoutes = [
    {
      url: `${baseUrl}/`,
      lastModified: products[0]?.updatedAt ?? new Date().toISOString(),
    },
  ];

  const dynamicRoutes = [
    ...categories.map((category) => ({
      url: `${baseUrl}/${ModelType.category}/${category.handle}`,
      lastModified: category.updatedAt,
    })),
    ...products.map((product) => ({
      url: `${baseUrl}/${ModelType.product}/${product.handle}`,
      lastModified: product.updatedAt,
    })),
  ];

  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) =>
      `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified}</lastmod>
  </url>`,
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
