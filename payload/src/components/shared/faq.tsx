import { getTranslations } from "next-intl/server";
import { FiMinus, FiPlus } from "react-icons/fi";

import { JsonLd } from "@/components/shared/elements-ssr";
import { Product } from "@/lib/core/types/payload-types";
import { cn } from "@/lib/core/util";
import { generateJsonLdFaq } from "@/lib/seo/jsonld";

export default async function Faq({
  faqs,
  title,
  className,
}: {
  faqs: Product["faqs"];
  title: string;
  className?: string;
}) {
  if (!faqs?.length) return null;
  const t = await getTranslations("general");

  return (
    <>
      <JsonLd data={generateJsonLdFaq(faqs, title)} />
      <section
        className={cn("w-full border-t", className)}
        aria-label={t("faq")}
      >
        <div className="my-4">
          <h3 className="faq-heading">{t("faq")}</h3>
        </div>
        <div className="flex flex-col gap-2 text-start">
          {faqs.map((item, index) => (
            <details key={index} className="faq-item group">
              <summary className="faq-summary">
                <div className="faq-icon relative">
                  <FiPlus className="h-4 w-4 group-open:hidden" />
                  <FiMinus className="hidden h-4 w-4 group-open:block" />
                </div>

                <span className="faq-question">{item.question}</span>
              </summary>

              <div className="faq-body">{item.answer}</div>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
