import type { DalStatic } from "@/lib/core/types/types";

// import Api from "@/lib/core/dal/api";
// const DAL: DalStatic = Api;

import Queries from "@/lib/core/dal/queries";
const DAL: DalStatic = Queries;

export default DAL;

/*
/*
  ============================================================
  Data Access Layer (DAL) — Mode Selector
  ============================================================

  Switch between two data strategies by toggling the imports above.

  ─────────────────────────────────────────────────────────────
  MODE 1 · Api  (Headless / REST)
  ─────────────────────────────────────────────────────────────
  Fetches data via Payload's REST endpoints (/api/)
  using Next.js fetch().

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

*/
