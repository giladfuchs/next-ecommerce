/*
  Data Access Layer (DAL)
  ========================

  This file defines which data layer the app uses.

  Available modes:

  1) Api (Headless / REST mode)
     - Uses fetch() against Payload REST endpoints (/api/*)
     - Uses Next.js cache with force-cache + tags
     - Clean frontend/backend separation
     - Recommended for real headless deployments
     - Lighter runtime (Payload can live on a separate server)

  IMPORTANT:
  In headless mode you MUST add a revalidation endpoint.
  Do NOT use revalidateTag inside Payload collections.
  Call the Next.js revalidation endpoint after mutations.

  2) Queries (Local Payload SDK mode)
     - Uses payload.find / payload.auth directly
     - Payload + Next run in same runtime (monolith)
     - Uses unstable_cache (harder to debug)

  Switch implementation below.
*/
import type { DalStatic } from "@/lib/core/dal/type";

import Api from "@/lib/core/dal/api";
const DAL: DalStatic = Api;

// import Queries from "@/lib/core/dal/queries"
// const DAL = Queries

export default DAL;
