import type { HtmlEmbedBlock as HtmlEmbedBlockProps } from "@/payload-types";

import { extractHtmlAssets } from "@/lib/core/util";

export default function HtmlEmbedBlock({ contentHtml }: HtmlEmbedBlockProps) {
  const { html, css, js } = extractHtmlAssets(contentHtml);

  return (
    <div className="min-w-0">
      {css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null}

      {html ? (
        <div
          className="w-full overflow-hidden"
          style={{
            minHeight: "100%",
            marginTop: html.includes("iframe") ? "-2.2rem" : undefined,
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      {js ? <script dangerouslySetInnerHTML={{ __html: js }} /> : null}
    </div>
  );
}
