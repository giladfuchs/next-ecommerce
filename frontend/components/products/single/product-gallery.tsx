"use client";
import { useState } from "react";
import Image from "next/image";
import { Box, Button } from "@mui/material";
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";
import GridTileImage from "@/components/products/grid/tile";
import { ProductImage } from "@/lib/types";

export type PropsProductGallery = {
  images: ProductImage[];
  isRtl: boolean;
};
export default function ProductGalleryClient({
  images,
  isRtl,
}: PropsProductGallery) {
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
              bottom: "0.5rem",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: isRtl ? "row" : "row-reverse",
                alignItems: "center",
                gap: "2rem",
              }}
            >
              <Button
                onClick={isRtl ? prev : next}
                aria-label="Next product image"
                sx={{
                  minWidth: 0,
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  bgcolor: "white",
                  boxShadow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { transform: "scale(1.2)" },
                }}
              >
                <ChevronRightIcon sx={{ fontSize: "2rem" }} />
              </Button>

              <Button
                onClick={isRtl ? next : prev}
                aria-label="Previous product image"
                sx={{
                  minWidth: 0,
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  bgcolor: "white",
                  boxShadow: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { transform: "scale(1.2)" },
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
                  width: "98%",
                  height: "94%",
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
