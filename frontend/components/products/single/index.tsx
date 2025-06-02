import ProductDescription from "./product-description";
import ProductGallery from "./product-gallery";
import { Product } from "lib/types";

const SingleProductLayout = ({ product }: { product: Product }) => (
  <div
    className="mx-auto max-w-(--breakpoint-2xl) px-4"
    data-testid="product-detail"
  >
    <div className="flex flex-col gap-6 rounded-lg border border-theme bg-theme p-8 md:p-12 lg:flex-row lg:gap-8 ">
      <div className="basis-full lg:basis-2/6">
        <ProductDescription product={product} />
      </div>
      <div className="h-full w-full basis-full lg:basis-4/6">
        <ProductGallery images={product.images} />
      </div>
    </div>
  </div>
);
export default SingleProductLayout;
