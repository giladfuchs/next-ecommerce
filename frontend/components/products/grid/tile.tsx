import React from "react";
import Image from "next/image";
import Label from "./label";
import { Box } from "@mui/material";

export default function GridTileImage({
  active,
  label,
  ...props
}: {
  active?: boolean;
  label?: {
    title: string;
    amount: number;
    position?: "bottom" | "center";
  };
} & React.ComponentProps<typeof Image>) {
  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderRadius: "0.5rem",
        border: "2px solid",
        borderColor: "var(--theme-border, #e0e0e0)",
        backgroundColor: "var(--theme-bg, #f9f9f9)",
        transition: "border-color 0.2s",
        "@media (hover: hover)": {
          "&:hover": {
            borderColor: "primary.main",
          },
          "&:hover img": {
            transform: "scale(1.05)",
          },
        },
      }}
    >
      {props.src && (
        <Image
          {...props}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            transition: "transform 0.3s ease-in-out",
          }}
        />
      )}

      {label && (
        <Label
          title={label.title}
          amount={label.amount}
          position={label.position}
        />
      )}
    </Box>
  );
}
