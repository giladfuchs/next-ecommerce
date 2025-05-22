"use client";

import { useIntl, FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { Box, Button, Grid, IconButton, Tooltip, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ShareIcon from "@mui/icons-material/Share";
import FacebookIcon from "@mui/icons-material/Facebook";
import { addItem } from "../../lib/store/cartSlice";
import { baseUrl } from "../../lib/config";
import { Product, ModelType } from "lib/types";
import { localeCache } from "../../lib/api";

export function ProductButtons({ product }: { product: Product }) {
  const dispatch = useDispatch();
  const intl = useIntl();

  const url = `${baseUrl}/${ModelType.product}/${product.handle}`;

  const handleAddToCart = () => {
    dispatch(addItem({ product }));
    const openCartEvent = new CustomEvent("open-cart");
    window.dispatchEvent(openCartEvent);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      alert(intl.formatMessage({ id: "product.shareNotSupported" }));
    }
  };

  return (
    <Grid item>
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          data-testid="add-to-cart-button"
          onClick={handleAddToCart}
          fullWidth
          variant="contained"
          disabled={!product.available}
          startIcon={localeCache.isRtl() ? <AddIcon /> : undefined}
          endIcon={!localeCache.isRtl() ? <AddIcon /> : undefined}
          aria-label={intl.formatMessage({ id: "product.addToCart" })}
          sx={{ direction: "ltr", color: "black !important", flexGrow: 1 }}
        >
          <FormattedMessage
            id={product.available ? "product.addToCart" : "product.outOfStock"}
          />
        </Button>

        <Stack direction="row" spacing={1}>
          <Tooltip title={intl.formatMessage({ id: "product.shareFacebook" })}>
            <IconButton
              aria-label={intl.formatMessage({ id: "product.shareFacebook" })}
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              data-testid="share-facebook"
              size="small"
              sx={{
                color: "#1877F2",
                padding: "4px",
                "&:hover": { backgroundColor: "#e3f2fd" },
              }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={intl.formatMessage({ id: "product.share" })}>
            <IconButton
              aria-label={intl.formatMessage({ id: "product.share" })}
              onClick={handleNativeShare}
              data-testid="share-native"
              size="small"
              sx={{
                color: "#6a1b9a",
                padding: "4px",
                "&:hover": { backgroundColor: "#f3e5f5" },
              }}
            >
              <ShareIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
    </Grid>
  );
}
