import {
  LinkJSXConverter,
  RichText as RichTextLexical,
} from "@payloadcms/richtext-lexical/react";

import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import type { HTMLAttributes } from "react";

import appConfig from "@/lib/core/config";
import { CollectionName, RoutePath } from "@/lib/core/types/types";
import { cn } from "@/lib/core/util";

const richTextLinkConverters = LinkJSXConverter({
  internalDocToHref: ({ linkNode }) => {
    const reference = linkNode.fields.doc;
    if (!reference || typeof reference.value !== "object") return "#";

    const slug = reference.value.slug;
    if (typeof slug !== "string" || !slug) return "#";

    if (reference.relationTo === CollectionName.pages) {
      return `/${slug === appConfig.HOME_SLUG ? "" : slug}`;
    }
    if (reference.relationTo === CollectionName.products) {
      return `/${RoutePath.product}/${slug}`;
    }
    if (reference.relationTo === CollectionName.category) {
      return `/${RoutePath.category}/${slug}`;
    }

    return "#";
  },
});

type Props = {
  data: DefaultTypedEditorState;
  disableIndent?: boolean | string[];
  enableGutter?: boolean;
  enableProse?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export default function RichText(props: Props) {
  const {
    className,
    disableIndent,
    enableProse = true,
    enableGutter = true,
    ...rest
  } = props;

  return (
    <RichTextLexical
      converters={({ defaultConverters }) => ({
        ...defaultConverters,
        ...richTextLinkConverters,
      })}
      disableIndent={disableIndent}
      className={cn(
        "payload-richtext min-w-0 break-words [overflow-wrap:anywhere] [&_a]:break-words [&_iframe]:max-w-full [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-5 sm:[&_ul]:ps-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:ps-5 sm:[&_ol]:ps-6 [&_li]:my-1",
        {
          container: enableGutter,
          "max-w-none": !enableGutter,
          "mx-auto prose md:prose-md dark:prose-invert": enableProse,
        },
        className,
      )}
      {...rest}
    />
  );
}
