import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";
import { requireAuthNext } from "next-ecommerce-backend/lib/service";

export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    try {
        requireAuthNext(req);

        const { DB } = await import("next-ecommerce-backend/lib/db");
        const { AuthController } = await import("next-ecommerce-backend/controller/auth");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const { id } = await params;
        const result = await AuthController.getOrder(id);

        return NextResponse.json(result);
    } catch (error) {
        const err = toHttpError(error);
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
}