export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import mockData from "lib/api/mock-data.json";

export async function GET() {
    try {
        const { DB } = await import("next-ecommerce-backend/lib/db");

        const { Product, Category, Order } = await import("next-ecommerce-backend/lib/entities");

        if (!DB.isInitialized) await DB.initialize();

        await DB.getRepository(Category).save(mockData.categories);
        await DB.getRepository(Product).save(mockData.products);
        await DB.getRepository(Order).save(mockData.orders);


        return NextResponse.json({ message: "✅ Imported mock data" });
    } catch (err) {
        console.error("❌ import-mock error:", err);
        return NextResponse.json(
            { error: err.message || "Unknown error" },
            { status: 500 }
        );
    }
}