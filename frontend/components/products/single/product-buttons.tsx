"use client";
import { useIntl, FormattedMessage } from "react-intl";
import { useDispatch } from "react-redux";
import { Box, Button, Grid, IconButton, Tooltip, Stack } from "@mui/material";
import {
  Add as AddIcon,
  Share as ShareIcon,
  Facebook as FacebookIcon,
} from "@mui/icons-material";
import { addItem } from "@/lib/store/cartSlice";
import { baseUrl } from "@/lib/config/config";
import { Product, ModelType } from "@/lib/types";

export type PropsProductButtons = {
  product: Product;
  isRtl: boolean;
};
export default function ProductButtons({
  product,
  isRtl,
}: PropsProductButtons) {
  const intl = useIntl();
  const dispatch = useDispatch();
  const url = `${baseUrl}/${ModelType.product}/${product.handle}`;

  const handleAddToCart = () => {
    dispatch(addItem({ product }));
    window.dispatchEvent(new CustomEvent("open-cart"));

    const btn = document.getElementById("add-to-cart-button");
    if (btn) {
      btn.classList.add("clicked");
      setTimeout(() => btn.classList.remove("clicked"), 200);
    }
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
    <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
      <Button
        id="add-to-cart-button"
        onClick={handleAddToCart}
        variant="contained"
        disabled={!product.available}
        endIcon={<AddIcon sx={{ px: 1 }} />}
        aria-label={intl.formatMessage({ id: "product.addToCart" })}
        data-testid="add-to-cart-button"
        sx={{
          minWidth: "12rem",
          backgroundColor: "#AAF2E7 !important",
          boxShadow: "none !important",
          transition: "transform 0.2s ease-in-out",
          animation: "pulseAnim 2.5s infinite",
          "@keyframes pulseAnim": {
            "0%": { transform: "scale(1)" },
            "50%": { transform: "scale(1.035)" },
            "100%": { transform: "scale(1)" },
          },
          "&.clicked": {
            transform: "scale(0.95)",
          },
          "&:hover": {
            backgroundColor: "#8FE0D1 !important",
            boxShadow: "none",
          },
        }}
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
            sx={{
              color: "#1877F2",
              "&:hover": { bgcolor: "#e3f2fd" },
            }}
          >
            <FacebookIcon sx={{ fontSize: "2.2rem" }} />
          </IconButton>
        </Tooltip>

        <Tooltip title={<FormattedMessage id="product.share" />}>
          <IconButton
            onClick={handleShare}
            aria-label={intl.formatMessage({ id: "product.share" })}
            data-testid="share-native"
            sx={{
              color: "#6a1b9a",
              "&:hover": { bgcolor: "#f3e5f5" },
            }}
          >
            <ShareIcon sx={{ fontSize: "2.2rem" }} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  );
}
