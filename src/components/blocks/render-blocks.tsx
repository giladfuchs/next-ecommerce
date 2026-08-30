import type { Page } from "@/payload-types";

import ArchiveBlock from "@/components/blocks/archive";
import CallToActionBlock from "@/components/blocks/call-to-action";
import ContentBlock from "@/components/blocks/content";
import FaqBlock from "@/components/blocks/faq";
import HtmlEmbedBlock from "@/components/blocks/html-embed";

export default function RenderBlocks({
  blocks,
  currentPageId,
  pageTitle,
}: {
  blocks: Page["layout"];
  currentPageId: number;
  pageTitle: string;
}) {
  if (!blocks?.length) return null;

  return blocks.map((block, index) => {
    const key = block.id ?? `${block.blockType}-${index}`;

    switch (block.blockType) {
      case "archive":
        return (
          <div className="my-10 min-w-0 sm:my-12 md:my-16" key={key}>
            <ArchiveBlock {...block} currentPageId={currentPageId} />
          </div>
        );
      case "cta":
        return (
          <div className="my-10 min-w-0 sm:my-12 md:my-16" key={key}>
            <CallToActionBlock {...block} />
          </div>
        );
      case "content":
        return (
          <div className="my-10 min-w-0 sm:my-12 md:my-16" key={key}>
            <ContentBlock {...block} />
          </div>
        );
      case "faq":
        return (
          <div className="my-10 min-w-0 sm:my-12 md:my-16" key={key}>
            <FaqBlock {...block} pageTitle={pageTitle} />
          </div>
        );
      case "htmlEmbed":
        return (
          <div className="my-10 min-w-0 sm:my-12 md:my-16" key={key}>
            <HtmlEmbedBlock {...block} />
          </div>
        );
    }
  });
}
