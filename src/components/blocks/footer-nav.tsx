import type { FooterNavBlock as FooterNavBlockProps } from "@/payload-types";

import CmsLink from "@/components/shared/cms-link";

export default function FooterNavBlock({ title, links }: FooterNavBlockProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      {title ? (
        <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
          {title}
        </h3>
      ) : null}

      <nav className="flex flex-col gap-2">
        {(links ?? []).map(({ link }, index) => (
          <CmsLink
            key={index}
            link={link}
            appearance="link"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-50"
          />
        ))}
      </nav>
    </div>
  );
}
