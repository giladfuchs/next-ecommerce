import { API_URL } from "@/lib/config";

export default function Head() {
  return (
    <>
      <meta name="robots" content="index,follow" />

      <link rel="preconnect" href={API_URL} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={API_URL} />

      {/* Fallback icon */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
    </>
  );
}
