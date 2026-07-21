import { getTranslations } from "next-intl/server";
import { FaStar } from "react-icons/fa";

import type { Review } from "@/lib/core/types/payload-types";

import { ReviewForm } from "@/components/shared/wrappers";
import { calculateAverageRating, cn, formatDate } from "@/lib/core/util";

const Stars = ({
  rating,
  className,
}: {
  rating: number;
  className?: string;
}) => {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: 5 }).map((_, i) => (
        <FaStar
          key={i}
          className={`w-4 h-4 ${
            i < rating ? "text-yellow-500" : "text-foreground/30"
          }`}
        />
      ))}
    </div>
  );
};

export default async function ProductReviews({
  reviews,
  productId,
}: {
  reviews: Review[];
  productId: number;
}) {
  if (!reviews?.length) return null;

  const t = await getTranslations("product");
  const average = calculateAverageRating(reviews);

  return (
    <section className="mt-16 flex justify-center px-4">
      <div className="w-full max-w-sm lg:max-w-3xl">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <h2 className="text-xl lg:text-2xl font-semibold">
            {t("customer_reviews")} ({reviews.length})
          </h2>

          <div className="self-end sm:self-auto sm:shrink-0">
            <ReviewForm productId={productId} />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-2xl font-semibold">{average.toFixed(1)}</span>
          <Stars rating={average} />
        </div>

        <div className="space-y-10">
          {reviews.map((review) => (
            <div key={review.id} className="pb-8 border-b last:border-none">
              <div className="flex justify-between items-center">
                <span className="font-medium">{review.authorName}</span>
                <span className="text-sm text-gray-500">
                  {formatDate(review.createdAt)}
                </span>
              </div>

              <Stars rating={review.rating} className="mt-2" />

              <h3 className="mt-3 font-semibold">{review.title}</h3>

              <p className="mt-2 text-gray-700 leading-relaxed break-words">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
