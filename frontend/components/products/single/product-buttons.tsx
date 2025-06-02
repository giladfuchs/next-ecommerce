"use client";
import { useIntl, FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { Box, Button, Grid, IconButton, Tooltip, Stack } from "@mui/material";
import {
  Add as AddIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import { addItem } from "lib/store/cartSlice";
import { baseUrl } from "lib/config/config";
import { Product, ModelType } from "lib/types";
import { localeCache } from "lib/api";

export default function ProductButtons({ product }: { product: Product }) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const isRtl = localeCache.isRtl();
  const url = `${baseUrl}/${ModelType.product}/${product.handle}`;

  const handleAddToCart = () => {
    dispatch(addItem({ product }));
    window.dispatchEvent(new CustomEvent("open-cart"));
  };

  const handleShare = async () => {
    if (!navigator.share) {
      alert(intl.formatMessage({ id: "product.shareNotSupported" }));
      return;
    }
    try {
      await navigator.share({ title: document.title, url });
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  return (
    <Grid item>
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          onClick={handleAddToCart}
          fullWidth
          variant="contained"
          disabled={!product.available}
          startIcon={isRtl ? <AddIcon /> : undefined}
          endIcon={!isRtl ? <AddIcon /> : undefined}
          aria-label={intl.formatMessage({ id: "product.addToCart" })}
          data-testid="add-to-cart-button"
          sx={{ direction: "ltr", color: "black !important", flexGrow: 1 }}
        >
          <FormattedMessage
            id={product.available ? "product.addToCart" : "product.outOfStock"}
          />
        </Button>

        <Stack direction="row" spacing={1}>
          <Tooltip title={<FormattedMessage id="product.shareFacebook" />}>
            <IconButton
              onClick={() =>
                window.open(
                  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                  "_blank",
                  "noopener,noreferrer",
                )
              }
              aria-label={intl.formatMessage({ id: "product.shareFacebook" })}
              data-testid="share-facebook"
              size="small"
              sx={{
                color: "#1877F2",
                p: "4px",
                "&:hover": { bgcolor: "#e3f2fd" },
              }}
            >
              <FacebookIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title={<FormattedMessage id="product.share" />}>
            <IconButton
              onClick={handleShare}
              aria-label={intl.formatMessage({ id: "product.share" })}
              data-testid="share-native"
              size="small"
              sx={{
                color: "#6a1b9a",
                p: "4px",
                "&:hover": { bgcolor: "#f3e5f5" },
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
