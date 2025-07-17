import ProductsGrid, { ProductItem } from "@/components/products/grid";
import { Box, Skeleton } from "@mui/material";

export function LoadingProductsList() {
  return (
    <>
      <Box sx={{ mb: 2, height: "1.5rem" }} />
      <ProductsGrid>
        {Array(12)
          .fill(0)
          .map((_, index) => (
            <ProductItem key={index}>
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#f5f5f5",
                  animation: "pulse 1.5s ease-in-out infinite",
                  "@keyframes pulse": {
                    "0%": { opacity: 1 },
                    "50%": { opacity: 0.5 },
                    "100%": { opacity: 1 },
                  },
                }}
              />
            </ProductItem>
          ))}
      </ProductsGrid>
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
    <Box
      sx={{
        maxWidth: "var(--breakpoint-2xl)",
        px: 2,
        mx: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", lg: "row" },
          gap: { xs: 3, lg: 4 },
          borderRadius: 2,
          border: "1px solid var(--theme-border, #e0e0e0)",
          backgroundColor: "var(--theme-bg, #f9f9f9)",
          p: { xs: 4, md: 6 },
          animation: "pulse 1.5s ease-in-out infinite",
          "@keyframes pulse": {
            "0%": { opacity: 1 },
            "50%": { opacity: 0.5 },
            "100%": { opacity: 1 },
          },
        }}
      >
        <Box sx={{ flex: { lg: "2 1 0" }, width: "100%" }}>
          <Skeleton
            variant="rounded"
            sx={{ width: "100%", aspectRatio: "1 / 1", borderRadius: 2 }}
          />
        </Box>

        <Box
          sx={{
            flex: { lg: "4 1 0" },
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Skeleton variant="rounded" sx={{ width: "75%", height: 40 }} />
          <Skeleton variant="rounded" sx={{ width: "50%", height: 24 }} />
          <Skeleton
            variant="rounded"
            sx={{ width: "100%", height: 48, bgcolor: "#e0e0e0" }}
          />
          <Skeleton
            variant="rounded"
            sx={{ width: "100%", height: 16, bgcolor: "#f0f0f0" }}
          />
          <Skeleton
            variant="rounded"
            sx={{ width: "83%", height: 16, bgcolor: "#f0f0f0" }}
          />
          <Skeleton
            variant="rounded"
            sx={{ width: "66%", height: 16, bgcolor: "#f0f0f0" }}
          />
          <Skeleton variant="rounded" sx={{ width: "100%", height: 256 }} />
        </Box>
      </Box>
    </Box>
  );
}
