"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

import type { Media, User, Product } from "@/lib/core/types/payload-types";
import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import CartModal from "@/components/cart/cart-modal";
import Search from "@/components/layout/search";
import ImageVideo from "@/components/shared/image-video";
import Button from "@/components/ui/button";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";
import { useTheme } from "@/lib/providers/theme";

const LivePreviewListener = () => {
  const router = useRouter();

  return (
    <RefreshRouteOnSave
      refresh={router.refresh}
      serverURL={appConfig.BASE_URL}
    />
  );
};

const AdminBar = ({
  adminBarProps = {},
}: {
  adminBarProps?: PayloadAdminBarProps;
}) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const onAuthChange = useCallback((user: User) => {
    setShow(
      Boolean(
        user && Array.isArray(user.roles) && user.roles.includes("admin"),
      ),
    );
  }, []);

  return (
    <div
      dir="ltr"
      className={cn(
        "w-full bg-black text-white md:px-18",
        show ? "block" : "hidden",
      )}
    >
      <PayloadAdminBar
        {...adminBarProps}
        className="container py-2 text-white"
        classNames={{
          controls: "font-medium text-white",
          logo: "text-white",
          user: "text-white",
        }}
        cmsURL={appConfig.SERVER_URL}
        logo={<span>Dashboard</span>}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -  PayloadAdminBar typing mismatch
        onAuthChange={onAuthChange}
        onPreviewExit={() => {
          fetch(`${appConfig.SERVER_URL}/preview/exit`).then(() => {
            router.push("/");
            router.refresh();
          });
        }}
        style={{
          backgroundColor: "transparent",
          padding: 0,
          position: "relative",
          zIndex: "unset",
        }}
      />
    </div>
  );
};

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("general");

  const isDark = theme === "dark";

  return (
    <Button
      variant="outline"
      className="border border-neutral-300 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 mb-1"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={t("toggle_theme")}
    >
      {isDark ? (
        <FiSun className="h-7 w-7 text-yellow-400" />
      ) : (
        <FiMoon className="h-7 w-7 text-blue-400" />
      )}
    </Button>
  );
};

type HeaderProps = {
  logo: Media;
  products: Product[];
  adminBarProps?: PayloadAdminBarProps;
};

const HeaderBar = ({ logo, products }: HeaderProps) => {
  return (
    <div className="sticky top-0 z-20 border-b bg-background max-h-17 md:px-18">
      <nav className="container flex items-center justify-between py-1 md:items-end">
        <div className="flex w-full items-end justify-between gap-3 md:gap-6">
          <div className="flex items-end gap-6">
            <Link className="flex items-center max-h-15" href="/">
              <ImageVideo
                resource={logo}
                imgClassName="h-15 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="w-full flex-1 md:flex-none md:max-w-md">
            <Search products={products} />
          </div>

          <div className="flex items-center justify-end gap-2 md:gap-4">
            <ThemeToggle />
            <CartModal />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default function HeaderClient({ adminBarProps, ...props }: HeaderProps) {
  return (
    <>
      <AdminBar adminBarProps={adminBarProps} />
      <LivePreviewListener />
      <HeaderBar {...props} />
    </>
  );
}
