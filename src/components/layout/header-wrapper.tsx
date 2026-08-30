import { draftMode } from "next/headers";

import type { Media } from "@/lib/core/types/payload-types";
import type { SiteSetting } from "@/payload-types";

import CmsLink from "@/components/shared/cms-link";
import { Header } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

type HeaderNavItems = NonNullable<
  NonNullable<SiteSetting["header"]>["navItems"]
>;

const DesktopNavigation = ({ navItems }: { navItems: HeaderNavItems }) => {
  if (!navItems.length) return null;

  return (
    <nav
      aria-label="Main navigation"
      className=" hidden border-b bg-background md:block md:px-18"
    >
      <div className="container flex items-center justify-center gap-6 py-2">
        {navItems.map(({ link, id }, index) => (
          <CmsLink
            key={id ?? index}
            link={link}
            appearance="link"
            className="text-sm font-medium text-neutral-700 hover:text-foreground dark:text-neutral-300"
          />
        ))}
      </div>
    </nav>
  );
};

export default async function HeaderWrapper({
  logo,
  header,
}: {
  logo: Media;
  header: SiteSetting["header"];
}) {
  const { isEnabled } = await draftMode();

  const products = await DAL.queryAllProducts();
  const navItems = header?.navItems ?? [];

  return (
    <div className="sticky top-0 z-20">
      <Header
        logo={logo}
        products={products}
        navItems={navItems}
        adminBarProps={{ preview: isEnabled }}
      />
      <DesktopNavigation navItems={navItems} />
    </div>
  );
}
