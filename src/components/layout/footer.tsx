import type { SiteSetting } from "@/payload-types";

import RenderFooterBlocks from "@/components/blocks/render-footer-blocks";

export default function Footer({ footer }: { footer: SiteSetting["footer"] }) {
  if (!footer) return null;

  return (
    <footer className="mt-auto border-t border-border py-8 px-4">
      {footer.blocks?.length ? (
        <div className="container mb-6">
          <RenderFooterBlocks blocks={footer.blocks} />
        </div>
      ) : null}
    </footer>
  );
}
