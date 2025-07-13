import { Box } from "@mui/material";
import { Price } from "components/shared/elements-ssr";
import { localeCache } from "lib/api";

export default function Label({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  const isRtl = localeCache.isRtl();
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        inset: isRtl ? "auto 0 0 auto" : "auto auto 0 0",
        width: "100%",
        px: { xs: "0.4rem", md: "0.8rem" },
        pb: "1rem",
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "9999rem",
          bgcolor: "var(--color-chip)",
          color: "var(--color-text-strong)",
          border: "1px solid var(--color-border)",
          px: "1rem",
          width: "17rem",
        }}
      >
        <Box
          component="h3"
          data-testid="product-card-title"
          sx={{
            fontSize: "1.2rem",
            lineHeight: 1,
            fontWeight: 600,
            flexGrow: 1,
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            textAlign: isRtl ? "right" : "left",
          }}
        >
          {title}
        </Box>

        <Box
          sx={{
            backgroundColor: "var(--color-accent)",
            borderRadius: "9999rem",
            px: "0.7rem",
            py: "0.3rem",
            fontWeight: "bold",
            lineHeight: 1.3,
            whiteSpace: "nowrap",
            color: "black",
          }}
        >
          <Price amount={amount} />
        </Box>
      </Box>
    </Box>
  );
}
