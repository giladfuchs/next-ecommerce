import type { HtmlEmbedBlock } from "@/payload-types";
import type { ScriptHTMLAttributes, StyleHTMLAttributes } from "react";

type EmbeddedScript = {
  attributes: ScriptHTMLAttributes<HTMLScriptElement>;
  content: string;
};

type EmbeddedStyle = {
  attributes: StyleHTMLAttributes<HTMLStyleElement>;
  content: string;
};

const BOOLEAN_SCRIPT_ATTRIBUTES = new Set(["async", "defer", "nomodule"]);

const SCRIPT_ATTRIBUTE_NAMES: Record<
  string,
  keyof ScriptHTMLAttributes<HTMLScriptElement>
> = {
  charset: "charSet",
  crossorigin: "crossOrigin",
  fetchpriority: "fetchPriority",
  nomodule: "noModule",
  referrerpolicy: "referrerPolicy",
};

const decodeAttributeValue = (value: string) =>
  value
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&amp;/gi, "&");

const parseAttributes = (
  source: string,
  names: Record<string, string>,
  booleanNames: Set<string> = new Set(),
): Record<string, string | boolean> => {
  const attributes: Record<string, string | boolean> = {};
  const attributePattern =
    /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

  for (const match of source.matchAll(attributePattern)) {
    const sourceName = match[1].toLowerCase();
    const name = names[sourceName] ?? sourceName;
    const rawValue = match[2] ?? match[3] ?? match[4] ?? "";
    const value = booleanNames.has(sourceName)
      ? true
      : decodeAttributeValue(rawValue);

    attributes[name] = value;
  }

  return attributes;
};

const extractEmbedAssets = (source: string) => {
  const styles: EmbeddedStyle[] = [];
  const scripts: EmbeddedScript[] = [];
  const html = source
    .replace(
      /<style\b([^>]*)>([\s\S]*?)<\/style\s*>/gi,
      (_, attributes: string, content: string) => {
        styles.push({
          attributes: parseAttributes(
            attributes,
            {},
          ) as StyleHTMLAttributes<HTMLStyleElement>,
          content,
        });
        return "";
      },
    )
    .replace(
      /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi,
      (_, attributes: string, content: string) => {
        scripts.push({
          attributes: parseAttributes(
            attributes,
            SCRIPT_ATTRIBUTE_NAMES,
            BOOLEAN_SCRIPT_ATTRIBUTES,
          ) as ScriptHTMLAttributes<HTMLScriptElement>,
          content,
        });
        return "";
      },
    )
    .trim();

  return { html, styles, scripts };
};

const hashContent = (value: string) => {
  let hash = 2_166_136_261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }

  return (hash >>> 0).toString(36);
};

export default function HtmlEmbedBlock({
  contentHtml,
  id,
}: Pick<HtmlEmbedBlock, "contentHtml" | "id">) {
  const { html, styles, scripts } = extractEmbedAssets(contentHtml);
  const embedId = `html-embed-${id || hashContent(contentHtml)}`;

  return (
    <div>
      {styles.map(({ attributes, content }, index) => (
        <style
          {...attributes}
          key={`${embedId}-style-${index}`}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ))}

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

      {scripts.map(({ attributes, content }, index) => {
        const scriptKey = `${embedId}-script-${index}`;

        if (typeof attributes.src === "string" && attributes.src) {
          return <script {...attributes} key={scriptKey} />;
        }

        return (
          <script
            {...attributes}
            key={scriptKey}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      })}
    </div>
  );
}
