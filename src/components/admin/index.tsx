"use client";

import { useTranslations } from "next-intl";
import { useState, type ComponentType } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui";
import { postJson } from "@/lib/core/util";
import { IntlProvider } from "@/lib/providers/intl";
import { SonnerProvider } from "@/lib/providers/sonner";

export const withProviders = <P extends object>(Inner: ComponentType<P>) => {
  return function Gated(props: P) {
    return (
      <IntlProvider>
        <SonnerProvider />
        <Inner {...props} />
      </IntlProvider>
    );
  };
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

export const RevalidateField = withProviders(RevalidateFieldInner);
