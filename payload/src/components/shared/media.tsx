import NextImage from "next/image";

// import Image from 'next/image'
import type { Media as MediaType } from "@/lib/core/types/payload-types";
import type { StaticImageData } from "next/image";

import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";

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
  resource: MediaType;
  size?: string;
  src?: StaticImageData;
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
  src: srcFromProps,
  width: widthFromProps,
}: Props) => {
  let width = widthFromProps;
  let height = heightFromProps;
  let src: StaticImageData | string = srcFromProps || "";

  if (!src && resource && typeof resource === "object") {
    width = width ?? resource.width ?? undefined;
    height = height ?? resource.height ?? undefined;
    src = `${appConfig.BASE_URL}${resource.url}`;
  }

  const sizes =
    sizeFromProps ??
    Object.entries(breakpoints)
      .map(([, value]) => `(max-width: ${value}px) ${value}px`)
      .join(", ");

  return (
    <NextImage
      alt={resource.alt!}
      className={cn(imgClassName)}
      fill={fill}
      height={!fill ? height : undefined}
      width={!fill ? width : undefined}
      src={src}
      sizes={sizes}
      priority={priority}
      quality={90}
    />
  );
};

const Video = ({ resource, videoClassName }: Props) => {
  if (!resource || typeof resource !== "object") return null;
  if (!resource.filename) return null;

  return (
    <video
      autoPlay
      controls
      loop
      muted
      playsInline
      className={cn(videoClassName)}
      aria-label={resource.alt}
    >
      <source src={`${appConfig.BASE_URL}/media/${resource.filename}`} />
    </video>
  );
};

export default function Media({ className, resource, ...rest }: Props) {
  const isVideo =
    typeof resource === "object" && resource?.mimeType?.includes("video");

  return (
    <div className={cn(className)}>
      {isVideo ? (
        <Video resource={resource} {...rest} />
      ) : (
        <MediaImage resource={resource} {...rest} />
      )}
    </div>
  );
}
