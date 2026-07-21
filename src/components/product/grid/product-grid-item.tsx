import Link from "next/link";

import type { Product, Media } from "@/lib/core/types/payload-types";

import { Price } from "@/components/shared/elements-ssr";
import ImageVideo from "@/components/shared/image-video";
import { RoutePath } from "@/lib/core/types/types";

export default function ProductGridItem({ product }: { product: Product }) {
  const { image, priceInUSD, title, slug } = product;

  return (
    <Link
      href={`/${RoutePath.product}/${slug}`}
      className="relative inline-block h-full w-full group"
    >
      <ImageVideo
        className="relative aspect-square border rounded-2xl p-4"
        height={80}
        width={80}
        imgClassName="h-full w-full object-cover rounded-2xl transition duration-300 ease-in-out group-hover:scale-102"
        resource={image as Media}
      />

      <div className="font-mono   flex justify-between items-center mt-4">
        <div>{title}</div>
        <Price amount={priceInUSD!} />
      </div>
    </Link>
  );
}
