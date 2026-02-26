export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";
import { requireAuthNext } from "next-ecommerce-backend/lib/service";

export async function POST(req, { params }) {
  try {
    requireAuthNext(req)
    const { DB } = await import("next-ecommerce-backend/lib/db");
    const { AuthController } = await import("next-ecommerce-backend/controller/auth");

    if (!DB.isInitialized) {
      await DB.initialize();
    }

    const body = await req.json();
    const result = await AuthController.saveCategory(params.add_or_id, body);
    return NextResponse.json(result, { status: params.add_or_id === "add" ? 201 : 200 });
  } catch (error) {
    const err = toHttpError(error);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}
