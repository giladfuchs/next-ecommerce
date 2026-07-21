import { Grid } from "@/components/shared/elements-ssr";
export const LoadingCategoryPageLayout = () => {
  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 py-8 animate-pulse">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* LEFT SIDEBAR SKELETON */}
        <div className="w-full lg:w-56 space-y-4">
          <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
          <div className="h-10 w-full bg-neutral-200 dark:bg-neutral-800 rounded-lg" />

          <div className="hidden lg:block space-y-3 pt-4">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-16 bg-neutral-200 dark:bg-neutral-800 rounded" />
            <div className="h-4 w-18 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="flex-1">
          <Grid className="grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(12)
              .fill(0)
              .map((_, index) => {
                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-950 overflow-hidden"
                  >
                    <div className="aspect-[4/3] w-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                      <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                  </div>
                );
              })}
          </Grid>
        </div>
      </div>
    </div>
  );
};

export const ProductPageSkeleton = () => {
  return (
    <div className="w-full max-w-[90rem] mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT SIDE */}
        <div className="space-y-6">
          {/* Title + Price */}
          <div className="flex items-center justify-between">
            <div className="h-8 w-60 bg-gray-200 rounded-md" />
            <div className="h-8 w-16 bg-gray-200 rounded-full" />
          </div>

          <div className="h-px w-full bg-gray-200" />

          {/* Size */}
          <div className="space-y-3">
            <div className="h-4 w-28 bg-gray-200 rounded-md" />
            <div className="h-10 w-16 bg-gray-200 rounded-md" />
          </div>

          <div className="h-px w-full bg-gray-200" />

          {/* Stock + Button */}
          <div className="space-y-4">
            <div className="h-4 w-40 bg-gray-200 rounded-md" />
            <div className="h-10 w-36 bg-gray-200 rounded-md" />
          </div>

          <div className="h-px w-full bg-gray-200" />

          {/* Description */}
          <div className="space-y-3">
            <div className="h-4 w-full bg-gray-200 rounded-md" />
            <div className="h-4 w-11/12 bg-gray-200 rounded-md" />
            <div className="h-4 w-10/12 bg-gray-200 rounded-md" />
            <div className="h-4 w-8/12 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        <div className="w-full aspect-square bg-gray-200 rounded-xl" />
      </div>
    </div>
  );
};

export const CheckoutPageSkeleton = () => {
  return (
    <div className="container min-h-[90vh] flex flex-col py-6 animate-pulse">
      <div className="h-10 w-56 mx-auto rounded-md bg-neutral-200 dark:bg-neutral-800" />

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-950 p-4">
          <div className="h-5 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 space-y-3">
            <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
            <div className="h-10 w-40 rounded bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-200/70 dark:border-neutral-800/70 bg-white dark:bg-neutral-950 p-4">
          <div className="h-5 w-44 rounded bg-neutral-200 dark:bg-neutral-800" />
          <div className="mt-4 space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                    <div className="h-4 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                  </div>
                  <div className="h-4 w-14 rounded bg-neutral-200 dark:bg-neutral-800" />
                </div>
              ))}
            <div className="pt-4 border-t border-neutral-200/70 dark:border-neutral-800/70 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-20 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
              <div className="flex items-center justify-between pt-2">
                <div className="h-5 w-16 rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-5 w-28 rounded bg-neutral-200 dark:bg-neutral-800" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
