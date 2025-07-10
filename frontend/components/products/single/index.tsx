import {Box} from "@mui/material";
import ProductDescription from "./product-description";
import ProductGallery from "./product-gallery";
import { Product } from "lib/types";

const SingleProductLayout = ({ product }: { product: Product }) => (
    <Box
        data-testid="product-detail"
        sx={{
          px: 2,
          mx: "auto",
          width: "100%",
          maxWidth: "var(--breakpoint-2xl)",
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
          }}
      >
        <Box sx={{ flexBasis: { lg: "33.3333%" }, width: "100%" }}>
          <ProductDescription product={product} />
        </Box>
        <Box sx={{ flexBasis: { lg: "66.6667%" }, width: "100%", height: "100%" }}>
          <ProductGallery images={product.images} />
        </Box>
      </Box>
    </Box>
);
export default SingleProductLayout;