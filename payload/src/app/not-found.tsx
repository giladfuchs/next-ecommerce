import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("general");

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: 0,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ marginBottom: "1rem" }}>404</h1>
        <p style={{ marginBottom: "1.5rem" }}>{t("pageNotFound")}</p>
        <Link href="/">{t("goHome")}</Link>
      </div>
    </div>
  );
}
