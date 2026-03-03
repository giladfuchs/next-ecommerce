import type { Media } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/shared/image-video";
import { cn } from "@/lib/core/util";

type Props = {
  active?: boolean;
  isInteractive?: boolean;

  media: Media;
};

export const GridTileImage = ({
  active,
  isInteractive = true,
  ...props
}: Props) => {
  return (
    <div
      className={cn(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black",
        {
          "border-2 border-blue-600": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
      )}
    >
      {props.media ? (
        <ImageVideo
          className={cn("relative h-full w-full object-cover", {
            "transition duration-300 ease-in-out group-hover:scale-105":
              isInteractive,
          })}
          height={80}
          imgClassName="h-full w-full object-cover"
          resource={props.media}
          width={80}
        />
      ) : null}
    </div>
  );
};
