import Link from "next/link";
import HeaderControls from "./HeaderControls";
import Logo from "components/layout/header/Logo";
import { API_URL } from "../../../lib/config";

export default function Header() {
  return (
    <nav className="sticky top-0 z-50 flex flex-col items-center p-4 lg:px-6 bg-theme dark:bg-theme-dark backdrop-blur">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/"
          prefetch={true}
          className="flex items-center"
          data-testid="site-logo"
        >
          <Logo />
        </Link>
        <HeaderControls />
      </div>
    </nav>
  );
}
