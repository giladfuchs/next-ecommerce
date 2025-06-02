import Image from "next/image";
import { ICON_IMAGE_URL } from "lib/config/config";

export default function Logo() {
  return (
    <div className="h-16 flex items-center">
      <Image
        src={(ICON_IMAGE_URL as string) || "/favicon.ico"}
        alt="logo"
        className="h-11 w-auto"
        width={80}
        height={48}
        priority
      />
    </div>
  );
}
