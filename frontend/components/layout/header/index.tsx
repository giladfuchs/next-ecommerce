import Link from "next/link";
import HeaderControls from "./header-controls";
import Logo from "components/layout/header/logo";

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-theme dark:bg-theme-dark">
      <div className="mx-auto w-full max-w-[1536px] px-6 flex items-center justify-between h-16">
        <Link
          href="/"
          prefetch
          data-testid="site-logo"
          className="flex items-center"
        >
          <Logo />
        </Link>
        <HeaderControls />
      </div>
    </nav>
  );
}
