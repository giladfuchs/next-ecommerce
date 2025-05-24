import Image from "next/image";
import { ICON_IMAGE_URL } from "lib/config/config";

export default function Logo() {
  return (
    <div className="flex flex-none items-center justify-center h-[45px] w-[60px] rounded-xl border-none bg-white dark:bg-transparent">
      <Image
        src={(ICON_IMAGE_URL as string) || "/favicon.ico"}
        alt="logo"
        width={80}
        height={20}
      />
    </div>
  );
}
