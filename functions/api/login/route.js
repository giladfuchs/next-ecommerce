export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";

export async function POST(req) {
    try {
        const { DB } = await import("next-ecommerce-backend/lib/db");
        const { PublicController } = await import("next-ecommerce-backend/controller/public");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const body = await req.json();
        const result = await PublicController.login(body);

        return NextResponse.json(result);
    } catch (error) {
        const err = toHttpError(error);
        return NextResponse.json({ error: err.message }, { status: err.status });
    }
}