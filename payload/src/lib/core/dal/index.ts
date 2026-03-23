import Api from "@/lib/core/dal/api";
import type { DalStatic } from "@/lib/core/dal/type";

const DAL: DalStatic = Api;

// import Queries from "@/lib/core/dal/queries";
// const DAL: DalStatic = Queries;

export default DAL;

/*
  ============================================================
  Data Access Layer (DAL) — Mode Selector
  ============================================================

  Switch between two data strategies by toggling the imports above.

  ─────────────────────────────────────────────────────────────
  MODE 1 · Api  (Headless / REST)
  ─────────────────────────────────────────────────────────────
  Fetches data via Payload's REST endpoints (/api/)
  using Next.js fetch() with force-cache + revalidation tags.

  Best for:
    • Clean frontend / backend separation
    • Payload running on a separate server or CDN edge
    • Teams that want a lighter Next.js runtime

  ⚠ IMPORTANT — Revalidation in headless mode:
    • Do NOT call revalidateTag() inside Payload collections.
    • Instead, expose a dedicated Next.js revalidation endpoint
      and call it after every mutation (hooks / external triggers).

  ─────────────────────────────────────────────────────────────
  MODE 2 · Queries  (Local Payload SDK)
  ─────────────────────────────────────────────────────────────
  Payload and Next.js share the same runtime (monolith).
  Caching is handled via unstable_cache.

  ⚠ NOTE — Next.js 16+ recommends "use cache" instead of unstable_cache.
    To migrate, three things need to change:

    1. Enable in next.config:
         const nextConfig = { cacheComponents: true };

    2. Remove old route cache config from page routes, such as:
         export const dynamic = "force-static";
         export const revalidate = false;

    3. Replace cached functions with the new cache model:
         async function getData() {
           "use cache";
           cacheLife("hours");
           cacheTag("my-tag");
           // ...
         }

    This template keeps unstable_cache intentionally so switching
    DAL modes (Api ↔ Queries) remains a one-line change.
*/
