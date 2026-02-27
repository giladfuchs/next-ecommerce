import { getTranslations } from "next-intl/server";
import { FiMinus, FiPlus } from "react-icons/fi";

import { Product } from "@/lib/core/types/payload-types";
import { cn } from "@/lib/core/util";

export const FaqSchema = ({
  faqs,
  title,
}: {
  faqs: Product["faqs"];
  title: string;
}) => {
  if (!faqs?.length) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `${title} FAQ`,
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  if (!jsonLd.mainEntity.length) return null;

  const json = JSON.stringify(jsonLd).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
};

export const Faq = async ({
  faqs,
  className,
}: {
  faqs: Product["faqs"];
  className?: string;
}) => {
  if (!faqs?.length) return null;
  const t = await getTranslations("product");

  return (
    <section className={cn("w-full border-t", className)} aria-label={t("faq")}>
      <div className="my-4">
        <h3 className="faq-heading"> {t("faq")} </h3>
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
  );
};
