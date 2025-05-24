import Link from "next/link";
import HeaderControls from "./header-controls";
import Logo from "components/layout/header/logo";

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 flex flex-col items-center p-4 lg:px-6 bg-theme dark:bg-theme-dark backdrop-blur">
      <div className="flex w-full items-center justify-between">
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
