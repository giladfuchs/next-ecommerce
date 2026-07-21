"use client";

import { useRouter, useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  useState,
  useEffect,
  type ChangeEvent,
  type ComponentType,
} from "react";
import { FaEnvelope, FaPhoneAlt, FaWhatsapp } from "react-icons/fa";
import {
  HiChevronLeft,
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineUnderline,
} from "react-icons/hi2";
import { toast } from "sonner";

import type { Category } from "@/lib/core/types/payload-types";

import Button from "@/components/ui/button";
import { buildCategoryHref, postJson } from "@/lib/core/util";
import { IntlProvider } from "@/lib/providers/intl";
import { SonnerProvider } from "@/lib/providers/sonner";

export const OrderContactActions = () => {
  const params = useParams();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  useEffect(() => {
    const id =
      params?.segments?.at(-1) ?? window.location.pathname.split("/").at(-1);
    if (!id || id === "create") return;
    fetch(`/api/orders/${id}?depth=0&select[phone]=true&select[email]=true`)
      .then((r) => r.json())
      .then(({ phone, email }) => {
        setPhone(phone);
        setEmail(email);
      });
  }, []);

  if (!phone && !email) return null;

  const base = {
    width: "2.5rem",
    height: "2.5rem",
    borderRadius: "9999px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    border: "1px solid var(--theme-elevation-150)",
    background: "var(--theme-elevation-50)",
  };

  return (
    <div style={{ display: "flex", gap: "1rem", padding: "0.5rem 0.25rem" }}>
      <a href={`tel:${phone}`} style={{ ...base, color: "#16a34a" }}>
        <FaPhoneAlt size="1.3rem" />
      </a>
      <a
        href={`https://wa.me/${phone.replace(/^0/, "972")}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...base, color: "#25D366" }}
      >
        <FaWhatsapp size="1.3rem" />
      </a>
      <a href={`mailto:${email}`} style={{ ...base, color: "#2563eb" }}>
        <FaEnvelope size="1.3rem" />
      </a>
    </div>
  );
};

const RevalidateFieldInner = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const t = useTranslations("admin.cacheControl");
  const handleClick = async () => {
    setLoading(true);
    try {
      await postJson<unknown>("globals/site-settings/revalidate-bootstrap", {});
      toast.success(t("success"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 500 }}>
      <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{t("title")}</h3>

      <p style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>
        {t("description")}
      </p>

      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          fontSize: 12,
          textDecoration: "underline",
          opacity: 0.7,
          marginBottom: 8,
          padding: 0,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        {open ? t("hideDetails") : t("readMore")}
      </Button>

      {open && (
        <div style={{ fontSize: 12, opacity: 0.75, marginBottom: 12 }}>
          {["footer", "products", "category"].map((key) => (
            <p key={key}>• {t(`details.${key}`)}</p>
          ))}

          <p style={{ marginTop: 6, fontWeight: 500 }}>{t("details.finish")}</p>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <Button type="button" onClick={handleClick} disabled={loading}>
          {loading ? t("revalidating") : t("revalidate")}
        </Button>
      </div>
    </div>
  );
};
export const RevalidateField = () => {
  return (
    <IntlProvider>
      <SonnerProvider />
      <RevalidateFieldInner />
    </IntlProvider>
  );
};
export const BackButtonClient = () => {
  const t = useTranslations("general");
  const router = useRouter();
  const handleBack = () => {
    if (window.history.length > 2) router.back();
    else router.push("/");
  };

  return (
    <div className="sticky top-4 z-10 max-h-0">
      <Button
        variant="ghost"
        onClick={handleBack}
        aria-label={t("back")}
        className="rounded-full"
      >
        <HiChevronLeft className="h-5 w-5" />
        {t("back")}
      </Button>
    </div>
  );
};

export const CategoriesDropdownClient = ({
  categories,
  currentSlug,
}: {
  categories: Category[];
  currentSlug: string;
}) => {
  const router = useRouter();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const slug = e.target.value;
    const href = buildCategoryHref(slug);
    if (currentSlug !== slug) router.push(href);
  };

  return (
    <div className="w-full">
      <select
        className="border-input mb-2 w-full rounded-md border bg-transparent px-3 py-2 text-sm"
        onChange={onChange}
        value={currentSlug}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.slug}>
            {c.title}
          </option>
        ))}
      </select>
    </div>
  );
};

type ButtonItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  selected?: boolean;
};

export const createAccessibilityButtons = (
  increaseFont: () => void,
  decreaseFont: () => void,
  reset: () => void,
  grayscale: boolean,
  setGrayscale: (v: boolean) => void,
  highContrast: boolean,
  setHighContrast: (v: boolean) => void,
  invert: boolean,
  setInvert: (v: boolean) => void,
  underlineLinks: boolean,
  setUnderlineLinks: (v: boolean) => void,
  readableFont: boolean,
  setReadableFont: (v: boolean) => void,
): ButtonItem[] => [
  { id: "zoomIn", icon: HiOutlineMagnifyingGlassPlus, onClick: increaseFont },
  { id: "zoomOut", icon: HiOutlineMagnifyingGlassMinus, onClick: decreaseFont },
  {
    id: "grayscale",
    icon: HiOutlineAdjustmentsHorizontal,
    onClick: () => setGrayscale(!grayscale),
    selected: grayscale,
  },
  {
    id: "contrast",
    icon: HiOutlineAdjustmentsHorizontal,
    onClick: () => setHighContrast(!highContrast),
    selected: highContrast,
  },
  {
    id: "invert",
    icon: HiOutlineEye,
    onClick: () => setInvert(!invert),
    selected: invert,
  },
  {
    id: "underline",
    icon: HiOutlineUnderline,
    onClick: () => setUnderlineLinks(!underlineLinks),
    selected: underlineLinks,
  },
  {
    id: "readableFont",
    icon: HiOutlineDocumentText,
    onClick: () => setReadableFont(!readableFont),
    selected: readableFont,
  },
  { id: "reset", icon: HiOutlineArrowPath, onClick: reset },
];
