import type { Product } from "@/lib/core/types/payload-types";

import GridOrAutoScroll from "@/components/shared/grid-or-auto-scroll";
import { Faq, RichText } from "@/components/ui";
import { RoutePath } from "@/lib/core/types/types";

type Props = {
  title: string;
  description: Product["description"];
  products: Product[];
  faqs?: Product["faqs"];
};

export default function CategoryPageLayout({
  title,
  description,
  products,
  faqs,
}: Props) {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>

      {description ? (
        <div className="text-[1.125rem] mt-2 text-start leading-relaxed px-2 lg:px-4 mx-auto">
          <RichText
            data={description}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      ) : null}

      <div className="container my-5 min-h-screen pb-4">
        <GridOrAutoScroll
          models={products}
          route={RoutePath.product}
          gridClassName="lg:grid-cols-3"
        />
      </div>

      <Faq faqs={faqs} title={title} className="max-w-xl mx-auto px-1 my-1" />
    </div>
  );
}
