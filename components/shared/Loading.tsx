import Grid, { ProductItem } from "components/products/grid";
import { Box, Skeleton } from "@mui/material";

export function LoadingProductsList() {
  return (
    <>
      <div className="mb-4 h-6" />
      <Grid className="grid-cols-2 lg:grid-cols-3">
        {Array(12)
          .fill(0)
          .map((_, index) => {
            return (
              <ProductItem
                key={index}
                className="animate-pulse bg-neutral-100 dark:bg-neutral-800"
              />
            );
          })}
      </Grid>
    </>
  );
}

export function LoadingTable() {
  return (
    <Box width="100%">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Skeleton
          key={idx}
          variant="rectangular"
          height={40}
          sx={{ mb: 1, borderRadius: 1 }}
        />
      ))}
    </Box>
  );
}

export function LoadingProductPage() {
  return (
    <div className="mx-auto max-w-(--breakpoint-2xl) px-4">
      <div className="flex flex-col gap-6 rounded-lg border border-theme bg-theme p-8 md:p-12 lg:flex-row lg:gap-8 animate-pulse">
        <div className="basis-full lg:basis-2/6">
          <div className="aspect-square w-full bg-gray-200 rounded-lg" />
        </div>

        <div className="h-full w-full basis-full lg:basis-4/6 space-y-4">
          <div className="h-10 w-3/4 bg-gray-200 rounded" />
          <div className="h-6 w-1/2 bg-gray-200 rounded" />
          <div className="h-12 w-full bg-gray-300 rounded" />
          <div className="h-4 w-full bg-gray-100 rounded" />
          <div className="h-4 w-5/6 bg-gray-100 rounded" />
          <div className="h-4 w-2/3 bg-gray-100 rounded" />
          <div className="h-64 w-full bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
