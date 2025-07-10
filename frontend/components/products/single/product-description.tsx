import { Box, Grid } from "@mui/material";
import ProductButtons from "./product-buttons";
import { Price } from "components/shared/elements-ssr";
import { Product } from "lib/types";
import { localeCache } from "lib/api";

export default function ProductDescription({ product }: { product: Product }) {
    const isLongTitle = product.title.length > 30;
    const isRtl = localeCache.isRtl();

    return (
        <>
            <Grid
                {...({ container: true } as any)}
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
                <Grid {...({ item: true } as any)} sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box
                        component="h1"
                        data-testid="product-title"
                        sx={{
                            fontSize: "2.2em",
                            fontWeight: "bold",
                            lineHeight: 1.3,
                            margin: "0.3em 0",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: isLongTitle ? "normal" : "nowrap",
                            textAlign: isRtl ? "right" : "left",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                        }}
                    >
                        {product.title}
                    </Box>
                </Grid>

                <Grid {...({ item: true } as any)}>
                    <Box
                        data-testid="product-price"
                        sx={{
                            backgroundColor: "var(--color-accent)",
                            px: 3,
                            py: "0.3em",
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
            </Grid>

            <Box data-testid="add-to-cart">
                <ProductButtons product={product} />
            </Box>

            <Box
                component="h3"
                data-testid="product-description"
                sx={{
                    mt: 4,
                    fontSize: "1.8em",
                    fontWeight: 400,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                    textAlign: isRtl ? "right" : "left",
                    color: "text.primary",
                }}
            >
                {product.description}
            </Box>
        </>
    );
}