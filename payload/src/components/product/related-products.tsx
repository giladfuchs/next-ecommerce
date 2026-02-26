// import Link from 'next/link'

// import { GridTileImage } from '@/components/product/grid/tile'

import type { Product } from "@/lib/core/types/payload-types";
//  const relatedProducts =
//     product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

//       {relatedProducts.length ? (
//         <div className="container">
//           <RelatedProducts products={relatedProducts as Product[]} />
//         </div>
//       ) : (
//         <></>
//       )}
export function RelatedProducts({ products }: { products: Product[] }) {
  if (!products.length) return null;

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">Related Products</h2>
      {/*<ul className="flex w-full gap-4 overflow-x-auto pt-1">*/}
      {/*  {products.map((product) => (*/}
      {/*    <li*/}
      {/*      className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"*/}
      {/*      key={product.id}*/}
      {/*    >*/}
      {/*      <Link className="relative h-full w-full" href={`/product/${product.slug}`}>*/}
      {/*        <GridTileImage*/}
      {/*          label={{*/}
      {/*            amount: product.priceInUSD!,*/}
      {/*            title: product.title,*/}
      {/*          }}*/}
      {/*          media={product.meta?.image as Media}*/}
      {/*        />*/}
      {/*      </Link>*/}
      {/*    </li>*/}
      {/*  ))}*/}
      {/*</ul>*/}
    </div>
  );
}
