import { Box, Chip, Typography } from "@mui/material";
import { Price } from "@/components/shared/elements-ssr";

export default function Label({
  title,
  amount,
}: {
  title: string;
  amount: number;
}) {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: "0.75rem",
        insetInlineStart: "0.75rem",
        maxWidth: "calc(100% - 1.5rem)",
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <Chip
        sx={{
          bgcolor: "var(--color-chip)",
          color: "var(--color-text-strong)",
          border: "1px solid var(--color-border)",
          borderRadius: "9999rem",
          fontSize: "1.2rem",
          display: "flex",
          alignItems: "center",
          maxWidth: "100%",
        }}
        label={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              gap: "0.5rem",
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
                flexGrow: 1,
              }}
              data-testid="product-card-title"
            >
              {title}
            </Typography>

            <Box
              sx={{
                backgroundColor: "var(--color-accent)",
                borderRadius: "9999rem",
                px: "0.6rem",
                py: "0.2rem",

                fontWeight: "bold",
                fontSize: "0.875rem",
                lineHeight: 1,
                color: "black",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <Price amount={amount} />
            </Box>
          </Box>
        }
      />
    </Box>
  );
}
