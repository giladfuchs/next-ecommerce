import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json(null, { status: 404 });
  }

  revalidateTag("data", "max");

  return NextResponse.json({ ok: true });
}
