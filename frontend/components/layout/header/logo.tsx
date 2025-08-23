import Image from "next/image";
import { Box } from "@mui/material";
import { ICON_IMAGE_URL } from "@/lib/config/config";

export default function Logo() {
  return (
    <Box
      sx={{
        height: "4rem",
        display: "flex",
        alignItems: "center",
        maxWidth: { xs: "8rem", sm: "none" },
      }}
    >
      <Image
        src={ICON_IMAGE_URL as string}
        alt="logo"
        width={80}
        height={48}
        priority
        style={{
          height: "2.75rem",
          width: "auto",
          maxWidth: "100%",
        }}
      />
    </Box>
  );
}
