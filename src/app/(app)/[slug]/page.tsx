import { notFound } from "next/navigation";

import type { MetaInput, PropsSlug } from "@/lib/core/types/types";
import type { Page } from "@/payload-types";
import type { Metadata } from "next";

import RenderBlocks from "@/components/blocks/render-blocks";
import RenderHero from "@/components/heros/render-hero";
import { JsonLd } from "@/components/shared/elements-ssr";
import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { getDecodedSlug } from "@/lib/core/util";
import {
  generateJsonLdBreadcrumbsPage,
  generateJsonLdPage,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = (await DAL.queryPageBySlug(slug)) as Page;
  return buildMetadata({
    ...(page?.meta ?? {}),
    path: slug === appConfig.HOME_SLUG ? "" : slug,
  } as MetaInput);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page) return notFound();
  // console.log(JSON.stringify(page.layout[0], null, 3));

  return (
    <article className="min-w-0 overflow-x-clip py-1">
      <JsonLd
        data={[generateJsonLdPage(page), generateJsonLdBreadcrumbsPage(page)]}
      />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <div className="container min-w-0 px-4 md:px-8">
        <RenderBlocks
          blocks={page.layout}
          currentPageId={page.id}
          pageTitle={page.title}
        />
      </div>
    </article>
  );
}
