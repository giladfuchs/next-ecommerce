import { Box } from "@mui/material";
import clsx from "clsx";
import { Price } from "components/shared/elements-ssr";

export default function Label({
  title,
  amount,
  position = "bottom",
}: {
  title: string;
  amount: number;
  position?: "bottom" | "center";
}) {
  return (
    <Box
      className={clsx("absolute bottom-0 left-0 w-full @container/label", {
        "lg:px-20 lg:pb-[35%]": position === "center",
      })}
      sx={{
        px: 2,
        pb: 2,
        display: "flex",
        justifyContent: "flex-start",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          borderRadius: "9999px",
          bgcolor: "var(--color-chip)",
          color: "var(--color-text-strong)",
          px: 1.5,
          py: 0.5,
          fontWeight: 600,
          fontSize: "0.9em",
          gap: 1,
          border: "1px solid var(--color-border)",
        }}
      >
        <h3
          className="product-title mr-4 line-clamp-2 grow pl-2 leading-none tracking-tight"
          data-testid="product-card-title"
          style={{
            fontSize: "1.2em",
            color: "var(--color-text-strong)",
          }}
        >
          {title}
        </h3>

        <Box
          className="price-badge black-bg"
          sx={{
            backgroundColor: "var(--color-accent)",
            borderRadius: "9999px",
            px: 1.5,
            py: 0.5,
            fontSize: "1.2em",
            fontWeight: "bold",
            width: "fit-content",
            whiteSpace: "nowrap",
            lineHeight: 1.3,
          }}
        >
          <Price amount={amount} className="price-text" />
        </Box>
      </Box>
    </Box>
  );
}
