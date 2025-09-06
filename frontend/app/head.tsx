import { API_URL, GOOGLE_SITE_VERIFICATION } from "@/lib/config";

export default function Head() {
  return (
    <>
      <meta name="robots" content="index,follow" />

      <link rel="preconnect" href={API_URL} crossOrigin="anonymous" />
      <link rel="dns-prefetch" href={API_URL} />
      <meta
        name="google-site-verification"
        content={GOOGLE_SITE_VERIFICATION}
      />
    </>
  );
}
