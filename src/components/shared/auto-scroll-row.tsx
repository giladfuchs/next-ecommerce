"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { type ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";

export default function AutoScrollRowClient({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      direction: appConfig.LOCAL.dir,
      align: "start",
      containScroll: false,
    },
    [
      AutoScroll({
        speed: 0.5,
        // delay: 4500,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  return (
    <div ref={emblaRef} className={cn("overflow-hidden", className)}>
      <div className="flex gap-4">{children}</div>
    </div>
  );
}
