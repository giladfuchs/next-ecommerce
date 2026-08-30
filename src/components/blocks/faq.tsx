import type { FaqBlock as FaqBlockProps } from "@/payload-types";

import { Faq } from "@/components/ui";

export default function FaqBlock({
  faqs,
  pageTitle,
}: FaqBlockProps & { pageTitle: string }) {
  return <Faq faqs={faqs} title={pageTitle} className="mx-auto max-w-2xl" />;
}
