export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";
import { requireAuthNext } from "next-ecommerce-backend/lib/service";


export async function GET(_req, { params }) {
    try {
        requireAuthNext(_req)
        const { DB } = await import("next-ecommerce-backend/lib/db");
        const { AuthController } = await import("next-ecommerce-backend/controller/auth");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const result = await AuthController.getOrder(params.id);
        return NextResponse.json(result);
    } catch (error) {
        const err = toHttpError(error);
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
}