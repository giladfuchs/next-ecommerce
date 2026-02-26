import Link from "next/link";

import type { Product, Media as MediaT } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import Media from "@/components/shared/media";
import { CollectionSlug } from "@/lib/core/types/types";

export const ProductGridItem = ({ product }: { product: Product }) => {
  const { gallery, priceInUSD, title, slug } = product;

  if (!slug) return null;

  return (
    <Link
      href={`/${CollectionSlug.product}/${slug}`}
      className="relative inline-block h-full w-full group"
    >
      <Media
        className="relative aspect-square border rounded-2xl p-4"
        height={80}
        width={80}
        imgClassName="h-full w-full object-cover rounded-2xl transition duration-300 ease-in-out group-hover:scale-102"
        resource={gallery?.[0]?.image as MediaT}
      />

      <div className="font-mono   flex justify-between items-center mt-4">
        <div>{title}</div>
        <Price amount={priceInUSD!} />
      </div>
    </Link>
  );
};
