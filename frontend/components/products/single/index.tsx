import { Box, Divider } from "@mui/material";
import ProductDescription from "./product-description";
import { Product } from "@/lib/types";
import { ProductGallery } from "@/components/shared/wrappers";

const SingleProductLayout = ({
  product,
  isRtl,
}: {
  product: Product;
  isRtl: boolean;
}) => (
  <Box
    data-testid="product-detail"
    dir={isRtl ? "rtl" : "ltr"}
    sx={{
      mx: "auto",
      width: "100%",
      maxWidth: "90rem",
      display: "flex",
      justifyContent: "center",
    }}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", lg: "row" },
        gap: { xs: "1.5rem", lg: "2rem" },
        borderRadius: "0.5rem",
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-bg)",
        p: { xs: "2rem", md: "3rem" },
        width: "100%",
      }}
    >
      <Box sx={{ flexBasis: { lg: "49.3333%" }, width: "100%" }}>
        <ProductDescription product={product} isRtl={isRtl} />
      </Box>
      <Box
        sx={{ flexBasis: { lg: "50.6667%" }, width: "100%", height: "100%" }}
      >
        <ProductGallery images={product.images} isRtl={isRtl} />
      </Box>
    </Box>
  </Box>
);

export default SingleProductLayout;
