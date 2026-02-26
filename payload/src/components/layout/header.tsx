"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";

import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import CartModal from "@/components/cart/cart-modal";
import Media from "@/components/shared/media";
import Button from "@/components/ui/button";
import appConfig from "@/lib/core/config";
import { Media as MediaT, User } from "@/lib/core/types/payload-types";
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

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("general");

  const isDark = theme === "dark";

  return (
    <Button
      variant="nav"
      className="mt-2"
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
const HeaderBar = ({ logo }: { logo: MediaT }) => {
  return (
    <div className="relative z-20 border-b md:px-18  max-h-17">
      <nav className="container flex items-center justify-between py-1 md:items-end">
        <div className="flex w-full items-end justify-between">
          <div className="flex w-full items-end   gap-6 md:w-1/3">
            <Link className="flex items-center max-h-15" href="/">
              <Media
                resource={logo}
                imgClassName="h-15 w-auto object-contain"
              />
            </Link>
          </div>

          <div className="flex justify-end gap-4  md:w-1/3">
            <ThemeToggle />
            <CartModal />
          </div>
        </div>
      </nav>
    </div>
  );
};

const AdminBar = ({
  adminBarProps,
}: {
  adminBarProps?: PayloadAdminBarProps;
}) => {
  const [show, setShow] = useState(false);

  const onAuthChange = useCallback((user: User) => {
    setShow(
      Boolean(
        user && Array.isArray(user.roles) && user.roles.includes("admin"),
      ),
    );
  }, []);

  return (
    <div
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
        cmsURL={appConfig.BASE_URL}
        logo={<span>Dashboard</span>}
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore -  PayloadAdminBar typing mismatch
        onAuthChange={onAuthChange}
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

export default function HeaderClient({ logo }: { logo: MediaT }) {
  return (
    <>
      <AdminBar />
      <LivePreviewListener />
      <HeaderBar logo={logo} />
    </>
  );
}
