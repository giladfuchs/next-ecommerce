"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ComponentType } from "react";
import { RiWheelchairLine } from "react-icons/ri";

import { createAccessibilityButtons } from "@/components/shared/elements-client";
import Button from "@/components/ui/button";

type ActionItemProps = {
  label: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  selected?: boolean;
};

const ActionItem = ({
  label,
  icon: Icon,
  onClick,
  selected,
}: ActionItemProps) => {
  return (
    <Button
      variant="select"
      selected={selected}
      onClick={onClick}
      className="my-2 flex w-full items-center justify-between text-sm"
    >
      <span>{label}</span>
      <Icon className="h-4 w-4 shrink-0" />
    </Button>
  );
};

export default function AccessibilityBarClient() {
  const t = useTranslations("accessibility");
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [invert, setInvert] = useState(false);
  const [grayscale, setGrayscale] = useState(false);
  const [underlineLinks, setUnderlineLinks] = useState(false);
  const [readableFont, setReadableFont] = useState(false);

  useEffect(() => {
    const sizes = Array.from(
      { length: 6 },
      (_, i) => `font-size-${90 + i * 5}`,
    );
    const html = document.documentElement;

    html.classList.remove(...sizes);
    html.classList.add(`font-size-${fontSize}`);

    html.classList.toggle("grayscale", grayscale);
    html.classList.toggle("high-contrast", highContrast);
    html.classList.toggle("invert", invert);
    html.classList.toggle("underline-links", underlineLinks);
    html.classList.toggle("readable-font", readableFont);
  }, [fontSize, grayscale, highContrast, invert, underlineLinks, readableFont]);

  useEffect(() => {
    if (!open) return;

    const onClickAway = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, [open]);

  const buttons = createAccessibilityButtons(
    () => setFontSize((v) => Math.min(115, v + 5)),
    () => setFontSize((v) => Math.max(90, v - 5)),
    () => {
      setFontSize(100);
      setHighContrast(false);
      setInvert(false);
      setGrayscale(false);
      setUnderlineLinks(false);
      setReadableFont(false);
    },
    grayscale,
    setGrayscale,
    highContrast,
    setHighContrast,
    invert,
    setInvert,
    underlineLinks,
    setUnderlineLinks,
    readableFont,
    setReadableFont,
  );

  return (
    <div className="fixed bottom-16 left-0 z-[999999] flex items-center">
      <Button
        onClick={() => setOpen((v) => !v)}
        className="h-10 w-10 rounded-r-full rounded-l-none bg-black p-0 text-white shadow-lg"
      >
        <RiWheelchairLine className="h-5 w-5" />
      </Button>

      {open && (
        <div
          ref={panelRef}
          className="ml-2 w-52 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-800 dark:bg-neutral-950"
        >
          <div className="mb-2 font-semibold">{t("title")}</div>

          {buttons.map(({ id, icon, onClick, selected }) => (
            <ActionItem
              key={id}
              label={t(id)}
              icon={icon}
              onClick={onClick}
              selected={selected}
            />
          ))}
        </div>
      )}
    </div>
  );
}
