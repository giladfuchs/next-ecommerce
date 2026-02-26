import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import type { CollectionSlug, PayloadRequest } from "payload";

import appConfig from "@/lib/core/config";
import Queries from "@/lib/core/queries";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const path = searchParams.get("path");
  const collection = searchParams.get("collection") as CollectionSlug | null;
  const slug = searchParams.get("slug");
  const secret = searchParams.get("previewSecret");
  if (!appConfig.PREVIEW_SECRET || secret !== appConfig.PREVIEW_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!path || !collection || !slug) {
    return new Response("Missing query params", { status: 400 });
  }

  if (!path.startsWith("/")) {
    return new Response("Path must be relative", { status: 400 });
  }

  const payload = await Queries.getPayload();

  try {
    const user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });

    if (!user) {
      (await draftMode()).disable();
      return new Response("Forbidden", { status: 403 });
    }
  } catch (err) {
    console.error({ err }, "Live preview auth failed");
    (await draftMode()).disable();
    return new Response("Forbidden", { status: 403 });
  }
  (await draftMode()).enable();
  redirect(path);
}
