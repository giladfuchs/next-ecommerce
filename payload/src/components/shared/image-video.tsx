import NextImage from "next/image";

import type { Media } from "@/lib/core/types/payload-types";

import { cn, resolveMediaUrl } from "@/lib/core/util";

const breakpoints = {
  l: 1440,
  m: 1024,
  s: 768,
};

interface Props {
  className?: string;
  fill?: boolean;
  height?: number;
  imgClassName?: string;
  priority?: boolean;
  resource: Media;
  size?: string;
  videoClassName?: string;
  width?: number;
}

const MediaImage = ({
  fill,
  height: heightFromProps,
  imgClassName,
  priority,
  resource,
  size: sizeFromProps,
  width: widthFromProps,
}: Props) => {
  const width = widthFromProps ?? resource.width ?? undefined;
  const height = heightFromProps ?? resource.height ?? undefined;
  const sizes =
    sizeFromProps ??
    Object.values(breakpoints)
      .map((value) => `(max-width: ${value}px) ${value}px`)
      .join(", ");
  return (
    <NextImage
      alt={resource.alt || ""}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height : undefined}
      width={!fill ? width : undefined}
      src={resolveMediaUrl(resource)}
      sizes={sizes}
      priority={priority}
      quality={90}
    />
  );
};

const MediaVideo = ({ resource, videoClassName }: Props) => (
  <video
    autoPlay
    controls
    loop
    muted
    playsInline
    className={cn(videoClassName)}
    aria-label={resource.alt || ""}
  >
    <source src={resolveMediaUrl(resource)} type={resource.mimeType!} />
  </video>
);

export default function ImageVideo({ className, resource, ...rest }: Props) {
  const isVideo = !!resource.mimeType?.includes("video");

  return (
    <div className={cn(className)}>
      {isVideo ? (
        <MediaVideo resource={resource} {...rest} />
      ) : (
        <MediaImage resource={resource} {...rest} />
      )}
    </div>
  );
}
