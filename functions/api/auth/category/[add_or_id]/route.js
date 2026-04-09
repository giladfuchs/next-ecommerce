import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";
import { requireAuthNext } from "next-ecommerce-backend/lib/service";

export const dynamic = "force-dynamic";

export async function POST(req, { params }) {
  try {
    requireAuthNext(req);

    const { DB } = await import("next-ecommerce-backend/lib/db");
    const { AuthController } = await import("next-ecommerce-backend/controller/auth");

    if (!DB.isInitialized) {
      await DB.initialize();
    }

    const body = await req.json();
    const { add_or_id } = await params;

    const result = await AuthController.saveCategory(add_or_id, body);

    return NextResponse.json(result, {
      status: add_or_id === "add" ? 201 : 200,
    });
  } catch (error) {
    const err = toHttpError(error);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}