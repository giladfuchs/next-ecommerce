import type { CallToActionBlock as CallToActionBlockProps } from "@/payload-types";

import CmsLink from "@/components/shared/cms-link";
import { RichText } from "@/components/ui";

export default function CallToActionBlock({
  richText,
  links,
}: CallToActionBlockProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border bg-neutral-50 px-4 py-5 text-center sm:rounded-3xl sm:px-6 dark:bg-neutral-900 md:px-10">
      {richText ? (
        <RichText
          data={richText}
          disableIndent
          enableGutter={false}
          className="mx-auto max-w-3xl"
        />
      ) : null}

      {links?.length ? (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {links.map(({ link, id }, index) => (
            <CmsLink
              key={id ?? index}
              link={link}
              className="h-auto max-w-full whitespace-normal break-words py-2 text-center"
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
