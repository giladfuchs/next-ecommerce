import type { SiteSetting } from "@/payload-types";

import ContentBlock from "@/components/blocks/content";
import FooterIconsBlock from "@/components/blocks/footer-icons";
import FooterNavBlock from "@/components/blocks/footer-nav";

type FooterBlocks = NonNullable<NonNullable<SiteSetting["footer"]>["blocks"]>;

export default function RenderFooterBlocks({
  blocks,
}: {
  blocks: FooterBlocks | null | undefined;
}) {
  if (!blocks?.length) return null;

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:grid-cols-4">
      {blocks.map((block, index) => {
        const key = block.id ?? `${block.blockType}-${index}`;

        switch (block.blockType) {
          case "footerNav":
            return <FooterNavBlock key={key} {...block} />;
          case "footerIcons":
            return <FooterIconsBlock key={key} {...block} />;
          case "content":
            return (
              <div className="col-span-2 sm:col-span-3 md:col-span-4" key={key}>
                <ContentBlock {...block} />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
