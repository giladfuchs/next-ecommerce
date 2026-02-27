/*
  Data Access Layer (DAL)
  ========================

  This file selects which data layer implementation the app uses.

  Two available modes:

  1) Api (Headless / REST mode)
     - Uses fetch() against Payload REST endpoints (/api/*)
     - Uses Next.js fetch caching (force-cache + tags)
     - Easier to debug in production
     - Cleaner separation between frontend and Payload
     - Recommended for real-world headless deployments
     - Lighter runtime (Payload admin can live separately)

  2) Queries (Local Payload SDK mode)
     - Uses payload.find / payload.auth directly
     - Runs Payload + Next in same runtime (monolith style)
     - Uses unstable_cache (can be harder to debug)

  Switch implementation below.
*/
import type { DalStatic } from "@/lib/core/dal/type";

import Api from "@/lib/core/dal/api";
const DAL: DalStatic = Api;

// import Queries from "@/lib/core/dal/queries"
// const DAL = Queries

export default DAL;
