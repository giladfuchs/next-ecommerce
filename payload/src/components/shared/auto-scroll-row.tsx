"use client";

import { type ReactNode, useEffect, useMemo, useRef } from "react";

import { cn } from "@/lib/core/util";

export default function AutoScrollRowClient({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const doubled = useMemo(
    () => (
      <>
        {children}
        {children}
      </>
    ),
    [children],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prevSnap = el.style.scrollSnapType;
    el.style.scrollSnapType = "none";

    let raf = 0;
    let running = true;

    const tick = () => {
      if (!running) return;

      const half = el.scrollWidth / 2;
      if (half <= 0) {
        raf = requestAnimationFrame(tick);
        return;
      }

      el.scrollLeft += 0.75;

      if (el.scrollLeft >= half) {
        el.scrollLeft -= half;
      }

      raf = requestAnimationFrame(tick);
    };

    const pause = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const resume = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);

    el.addEventListener("mouseenter", pause);
    el.addEventListener("mouseleave", resume);
    el.addEventListener("touchstart", pause, { passive: true });
    el.addEventListener("touchend", resume, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      el.style.scrollSnapType = prevSnap;

      el.removeEventListener("mouseenter", pause);
      el.removeEventListener("mouseleave", resume);
      el.removeEventListener("touchstart", pause);
      el.removeEventListener("touchend", resume);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "flex gap-4 overflow-x-auto scroll-smooth pb-2 no-scrollbar",
        className,
      )}
    >
      {doubled}
    </div>
  );
}
