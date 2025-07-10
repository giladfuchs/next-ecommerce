"use client";

import { useState } from "react";
import Image from "next/image";
import { Box, Button, Divider } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import GridTileImage from "components/products/grid/tile";
import { ProductImage } from "lib/types";
import { localeCache } from "lib/api";

export default function ProductGallery({ images }: { images: ProductImage[] }) {
  const [imageIndex, setImageIndex] = useState(0);
  const next = () => setImageIndex((prev) => (prev + 1) % images.length);
  const prev = () =>
    setImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const currentImage = images[imageIndex];
  return (
    <Box>
      <Box
        sx={{
          position: "relative",
          aspectRatio: "1 / 1",
          height: "100%",
          maxHeight: "34.375rem",
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Image
          fill
          sizes="(min-width: 1024px) 66vw, 100vw"
          src={currentImage?.url || ""}
          alt={currentImage?.altText || ""}
          style={{
            objectFit: "contain",
            width: "100%",
            height: "100%",
            display: "block",
            marginInline: "auto",
          }}
          priority
        />

        {images.length > 1 && (
          <Box
            sx={{
              position: "absolute",
              bottom: "1%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: localeCache.isRtl() ? "row" : "row-reverse",
                alignItems: "center",
                gap: "2rem",
              }}
            >
              <Button
                onClick={localeCache.isRtl() ? prev : next}
                aria-label="Next product image"
                sx={{
                  minWidth: 0,
                  padding: 0,
                  width: "3rem",
                  height: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: "2rem" }} />
              </Button>

              <Button
                onClick={localeCache.isRtl() ? next : prev}
                aria-label="Previous product image"
                sx={{
                  minWidth: 0,
                  padding: 0,
                  width: "3rem",
                  height: "3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": {
                    transform: "scale(1.2)",
                  },
                }}
              >
                <ChevronLeftIcon sx={{ fontSize: "2rem" }} />
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {images.length > 1 && (
        <Box
          component="ul"
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
            py: 1,
            my: 3,
            overflowX: "auto",
            listStyle: "none",
            paddingInline: 0,
          }}
        >
          {images.map((image, idx) => (
            <Box
              component="li"
              key={image.url}
              sx={{
                width: "5rem",
                height: "5rem",
              }}
            >
              <Button
                onClick={() => setImageIndex(idx)}
                aria-label="Select product image"
                sx={{
                  width: "100%",
                  height: "100%",
                  minWidth: 0,
                  padding: 0,
                }}
              >
                <GridTileImage
                  alt={image.altText}
                  src={image.url}
                  width={80}
                  height={80}
                  active={idx === imageIndex}
                />
              </Button>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
