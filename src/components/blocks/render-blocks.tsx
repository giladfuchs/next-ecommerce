import type { ResolvedPage, ResolvedPageBlock } from "@/lib/core/types/types";
import type { ReactNode } from "react";

import ArchiveBlock from "@/components/blocks/archive";
import CallToActionBlock from "@/components/blocks/call-to-action";
import ContentBlock from "@/components/blocks/content";
import FaqBlock from "@/components/blocks/faq";
import GalleryBlock from "@/components/blocks/gallery";
import HtmlEmbedBlock from "@/components/blocks/html-embed";

type BlockByType<T extends ResolvedPageBlock["blockType"]> = Extract<
  ResolvedPageBlock,
  { blockType: T }
>;

const blockRenderers = {
  archive: (block: BlockByType<"archive">) => <ArchiveBlock {...block} />,
  cta: (block: BlockByType<"cta">) => <CallToActionBlock {...block} />,
  content: (block: BlockByType<"content">) => <ContentBlock {...block} />,
  faq: (block: BlockByType<"faq">, pageTitle: string) => (
    <FaqBlock {...block} pageTitle={pageTitle} />
  ),
  gallery: (block: BlockByType<"gallery">) => <GalleryBlock {...block} />,
  htmlEmbed: (block: BlockByType<"htmlEmbed">) => <HtmlEmbedBlock {...block} />,
} satisfies {
  [T in ResolvedPageBlock["blockType"]]: (
    block: BlockByType<T>,
    pageTitle: string,
  ) => ReactNode;
};

export default function RenderBlocks({
  blocks,
  pageTitle,
}: {
  blocks: ResolvedPage["layout"];
  pageTitle: string;
}) {
  if (!blocks?.length) return null;

  return blocks.map((block, index) => {
    if (!block?.blockType || !(block.blockType in blockRenderers)) return null;

    const render = blockRenderers[block.blockType] as (
      value: ResolvedPageBlock,
      title: string,
    ) => ReactNode;

    return (
      <div
        className="my-10 min-w-0 sm:my-12 md:my-16"
        key={block.id ?? `${block.blockType}-${index}`}
      >
        {render(block, pageTitle)}
      </div>
    );
  });
}
