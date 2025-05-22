import clsx from "clsx";
import Image from "next/image";
import { ICON_IMAGE_URL } from "../../../lib/config";

export default function Logo({ size }: { size?: "sm" | undefined }) {
  return (
    <div
      className={clsx(
        "flex flex-none items-center justify-center border-none bg-white dark:bg-transparent",
        {
          "h-[45px] w-[60px] rounded-xl": !size,
          "h-[30px] w-[30px] rounded-lg": size === "sm",
        },
      )}
    >
      <Image src={ICON_IMAGE_URL as string} alt="logo" width={80} height={20} />
    </div>
  );
}
