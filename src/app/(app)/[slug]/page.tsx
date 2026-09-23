import { notFound } from "next/navigation";

import type { PropsSlug } from "@/lib/core/types/types";
import type { Metadata } from "next";

import RenderBlocks from "@/components/blocks/render-blocks";
import RenderHero from "@/components/blocks/render-hero";
import { JsonLdViewScript } from "@/components/shared/elements-ssr";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/util";
import { buildMetadataByModel } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page) return { robots: "noindex" };
  return buildMetadataByModel(CollectionName.pages, page, slug);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page) return notFound();
  return (
    <article className="min-w-0 overflow-x-clip py-1">
      <JsonLdViewScript
        collection={CollectionName.pages}
        entity={page}
        slug={slug}
      />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <div className="container min-w-0 px-4 md:px-8">
        <RenderBlocks blocks={page.layout} pageTitle={page.title} />
      </div>
    </article>
  );
}
