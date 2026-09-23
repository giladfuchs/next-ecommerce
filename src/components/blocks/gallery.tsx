import { getTranslations } from "next-intl/server";

import type { GalleryMedia } from "@/payload-types";

import PhotoGallery from "@/components/shared/photo-gallery";

type GalleryBlockProps = {
  id?: number | string | null;
  images: { image: number | GalleryMedia | null }[];
  title?: string | null;
  variant?: "page" | "product";
};

export default async function GalleryBlock({
  title,
  images,
  id,
  variant = "page",
}: GalleryBlockProps) {
  const t = await getTranslations("blocks.gallery");
  const galleryImages = images
    .map(({ image }) => image)
    .filter(
      (image): image is GalleryMedia =>
        image !== null && typeof image === "object",
    );

  const gallery = (
    <PhotoGallery
      id={id as string}
      images={galleryImages}
      selectImageLabel={t("select_image")}
    />
  );

  if (variant === "product") return gallery;

  return (
    <section className="mx-auto max-w-3xl px-5">
      {title ? (
        <h2 className="mb-2 text-center text-2xl font-semibold">{title}</h2>
      ) : null}
      {gallery}
    </section>
  );
}
