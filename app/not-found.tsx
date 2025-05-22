"use client";

import Link from "next/link";
import { FormattedMessage } from "react-intl";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">
        <FormattedMessage id="notFound.title" />
      </h1>
      <p className="text-lg mb-8">
        <FormattedMessage id="notFound.description" />
      </p>
      <Link href="/" className="text-blue-500 underline">
        <FormattedMessage id="notFound.backHome" />
      </Link>
    </div>
  );
}
