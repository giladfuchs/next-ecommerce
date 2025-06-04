export const dynamic = "force-dynamic";

import {NextResponse} from "next/server";

// config({path: path.resolve(process.cwd(), '../.env')});

export async function GET() {
    try {
        const { DB } = await import("next-ecommerce-backend/lib/db");
        const { getPublicData } = await import("next-ecommerce-backend/controller/public");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const { products, categories } = await getPublicData(DB);

        return NextResponse.json({ products, categories });
    } catch (err) {
        console.error("❌ ERROR in /functions/data:", err);
        return NextResponse.json(
            { error: err.message ?? "unknown" },
            { status: 500 }
        );
    }
}