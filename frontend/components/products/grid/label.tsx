import { Box } from "@mui/material";
import { Price } from "components/shared/elements-ssr";
import { localeCache } from "lib/api";

export default function Label({
                                  title,
                                  amount,
                                  position = "bottom",
                              }: {
    title: string;
    amount: number;
    position?: "bottom" | "center";
}) {
    const isRtl = localeCache.isRtl();

    return (
        <Box
            sx={{
                position: "absolute",
                bottom: 0,
                left: isRtl ? "auto" : 0,
                right: isRtl ? 0 : "auto",
                width: "100%",
                px: position === "center" ? { lg: "5rem" } : "1.2rem",
                pb: position === "center" ? { lg: "35%" } : "1.2rem",
                display: "flex",
                justifyContent: isRtl ? "flex-end" : "flex-start",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "9999rem",
                    bgcolor: "var(--color-chip)",
                    color: "var(--color-text-strong)",
                    border: "0.1rem solid var(--color-border)",
                    padding: "0.6rem 1rem",
                    gap: "1.2rem",
                    width: "17rem", // ✅ fixed width
                }}
            >
                <Box
                    component="h3"
                    data-testid="product-card-title"
                    sx={{
                        fontSize: "1.1rem",
                        lineHeight: 1.3,
                        fontWeight: 600,
                        color: "var(--color-text-strong)",
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
                        px: "0.8rem",
                        py: "0.4rem",
                        fontSize: "1rem",
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