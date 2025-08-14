export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";
import {toHttpError} from "next-ecommerce-backend/lib/util";

export async function GET() {
    try {
        const {DB} = await import("next-ecommerce-backend/lib/db");
        const {PublicController} = await import("next-ecommerce-backend/controller/public");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const {products, categories} = await PublicController.getData();

        return NextResponse.json({products, categories});
    } catch (error) {
        const err = toHttpError(error);
        console.error("❌ API /data failed:", err.message);
        return NextResponse.json({products: [], categories: [], error: err.message});
    }
}