import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const path = searchParams.get("path");
  const secret = searchParams.get("previewSecret");

  if (!appConfig.PREVIEW_SECRET || secret !== appConfig.PREVIEW_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!path) {
    return new Response("Missing path", { status: 400 });
  }

  if (!path.startsWith("/")) {
    return new Response("Path must be relative", { status: 400 });
  }

  const draft = await draftMode();

  try {
    const user = await DAL.queryCurrentUser(req);

    if (!user) {
      draft.disable();
      return new Response("Forbidden", { status: 403 });
    }
  } catch (error) {
    console.error("Live preview auth failed", error);
    draft.disable();
    return new Response("Forbidden", { status: 403 });
  }

  draft.enable();
  redirect(path);
}
