import clsx from "clsx";

import type { Media as MediaType } from "@/lib/core/types/payload-types";

import Media from "@/components/shared/media";

type Props = {
  active?: boolean;
  isInteractive?: boolean;

  media: MediaType;
};

export const GridTileImage = ({
  active,
  isInteractive = true,
  ...props
}: Props) => {
  return (
    <div
      className={clsx(
        "group flex h-full w-full items-center justify-center overflow-hidden rounded-lg border bg-white hover:border-blue-600 dark:bg-black",
        {
          "border-2 border-blue-600": active,
          "border-neutral-200 dark:border-neutral-800": !active,
        },
      )}
    >
      {props.media ? (
        <Media
          className={clsx("relative h-full w-full object-cover", {
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
