import { ProductButtons } from "components/product/ProductButtons";
import Price from "components/shared/Price";
import { Product } from "lib/types";
import { Box, Grid } from "@mui/material";
import { localeCache } from "../../lib/api";

export function ProductDescription({ product }: { product: Product }) {
  const isLongTitle = product.title.length > 30;

  return (
    <>
      <Grid
        container
        direction={isLongTitle ? "column" : "row"}
        spacing={1}
        alignItems={isLongTitle ? "flex-start" : "center"}
        justifyContent="space-between"
        sx={{
          mb: 6,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 3,
        }}
      >
        <Grid item sx={{ flexGrow: 1, minWidth: 0 }}>
          <h1
            className="product-title line-clamp-2 leading-tight tracking-tight"
            data-testid="product-title"
            style={{
              fontSize: "2.2em",
              fontWeight: "bold",
              lineHeight: "1.3",
              marginTop: "0.3em",
              marginBottom: "0.3em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isLongTitle ? "normal" : "nowrap",
              textAlign: localeCache.isRtl() ? "right" : "left",
            }}
          >
            {product.title}
          </h1>
        </Grid>
        <Grid item>
          <Box
            data-testid="product-price"
            className="price-badge"
            sx={{
              backgroundColor: "var(--color-accent)",
              px: 3,
              py: 1.2,
              borderRadius: 999,
              fontSize: "1.2em",
              fontWeight: "bold",
              width: "fit-content",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
              color: "black",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Price amount={product.price} />
          </Box>
        </Grid>
        <Grid item></Grid>
      </Grid>

      <div data-testid="add-to-cart">
        <ProductButtons product={product} />
      </div>

      <h3
        data-testid="product-description"
        className="text-primary mt-4 leading-relaxed"
        style={{
          fontSize: "1.8em",
          fontWeight: 400,
          whiteSpace: "pre-line",
          textAlign: localeCache.isRtl() ? "right" : "left",
        }}
      >
        {product.description}
      </h3>
    </>
  );
}
