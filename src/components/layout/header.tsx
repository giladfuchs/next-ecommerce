"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { FiSun, FiMoon, FiSearch, FiX, FiMenu } from "react-icons/fi";

import type { Media, User, Product } from "@/lib/core/types/payload-types";
import type { SiteSetting } from "@/payload-types";
import type { PayloadAdminBarProps } from "@payloadcms/admin-bar";

import AccessibilityBar from "@/components/layout/accessibility-bar";
import Search from "@/components/layout/search";
import CmsLink from "@/components/shared/cms-link";
import ImageVideo from "@/components/shared/image-video";
import CartModal from "@/components/shop/cart/cart-modal";
import { Button } from "@/components/ui";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/util";
import { useTheme } from "@/lib/providers/theme";

const LivePreviewListener = () => {
  const router = useRouter();

  return (
    <RefreshRouteOnSave
      refresh={router.refresh}
      serverURL={appConfig.SERVER_URL}
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
      className="border-0 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800 mb-1"
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
  navItems: HeaderNavItems;
  adminBarProps?: PayloadAdminBarProps;
};

type HeaderNavItems = NonNullable<
  NonNullable<SiteSetting["header"]>["navItems"]
>;

const MobileMenu = ({ navItems }: { navItems: HeaderNavItems }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  if (!navItems.length) return null;

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="mb-1 border-0 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md md:hidden dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <FiMenu className="size-7" />
      </Button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] bg-black/50 md:hidden"
              role="presentation"
              onClick={() => setOpen(false)}
            >
              <div
                className="absolute top-0 start-0 flex h-full w-[min(20rem,85vw)] flex-col gap-6 bg-background p-4 shadow-xl"
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                onClick={(event) => event.stopPropagation()}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="self-start border-0"
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <FiX className="size-6" />
                </Button>

                <nav className="flex flex-col gap-4">
                  {navItems.map(({ link, id }, index) => (
                    <div key={id ?? index} onClick={() => setOpen(false)}>
                      <CmsLink
                        link={link}
                        appearance="link"
                        className="w-full justify-start text-base"
                      />
                    </div>
                  ))}
                </nav>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

const SearchToggle = ({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) => {
  const t = useTranslations("general");

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative flex items-center justify-center border-0 mb-1 border-neutral-300 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      onClick={onClick}
      aria-label={t("search")}
      aria-expanded={open}
    >
      {open ? <FiX className="size-7" /> : <FiSearch className="size-7" />}
    </Button>
  );
};

const HeaderBar = ({ logo, products, navItems }: HeaderProps) => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="relative border-b bg-background md:px-18">
      <nav className="container flex min-w-0 items-center justify-between px-2 py-1 sm:px-4 md:max-h-17 md:items-end md:px-0">
        <div className="grid w-full min-w-0 grid-cols-3 items-center gap-2 sm:gap-3 md:items-end">
          <div className="flex shrink-0 items-center justify-start gap-2">
            <MobileMenu navItems={navItems} />
            <SearchToggle
              open={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
            />
          </div>

          <div className="flex min-w-0 flex-1 items-center justify-center">
            <Link className="flex max-h-12 items-center md:max-h-15" href="/">
              <ImageVideo resource={logo} imgClassName="object-contain h-10" />
            </Link>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-2 md:gap-4">
            <ThemeToggle />
            <CartModal />
          </div>
        </div>
      </nav>

      {searchOpen ? (
        <div className="absolute inset-x-0 lg:top-[calc(100%-3.5rem)] z-50 px-2 py-3 sm:px-4 md:px-18">
          <div className="container mx-auto">
            <Search products={products} onClose={() => setSearchOpen(false)} />
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default function HeaderClient({ adminBarProps, ...props }: HeaderProps) {
  return (
    <>
      <AdminBar adminBarProps={adminBarProps} />
      <LivePreviewListener />
      <HeaderBar {...props} />
      <AccessibilityBar />
    </>
  );
}
