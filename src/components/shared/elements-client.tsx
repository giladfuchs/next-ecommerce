"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { Children, type ReactNode } from "react";

import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";

export const AutoScrollRowClient = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const itemCount = Children.count(children);

  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      direction: appConfig.LOCAL.dir,
      align: "start",
      containScroll: false,
    },
    [
      AutoScroll({
        active: itemCount >= 3,
        breakpoints: {
          "(min-width: 1024px)": {
            active: itemCount >= 5,
          },
        },
        speed: 0.5,
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
};
