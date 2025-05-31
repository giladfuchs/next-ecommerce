import { NextResponse } from "next/server";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), '../.env') });


export async function GET() {
    try {
        console.log("🟨 GET /functions/data");

        // @ts-ignore - importing from compiled JS
        const { DB } = await import("../dist/src/lib/db.js");
        // @ts-ignore
        const { Product, Category } = await import("../dist/src/lib/entities.js");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const [products, categories] = await Promise.all([
            DB.getRepository(Product).find({
                relations: ["images"],
                order: {
                    updatedAt: "DESC",
                    images: {
                        position: "ASC",
                    },
                },
            }),
            DB.getRepository(Category).find({ order: { position: "ASC" } }),
        ]);

        const categories_map_id_handle = Object.fromEntries(
            categories.map((c: any) => [c.id, c.handle])
        ) as Record<number, string>;

        const formatted_products = products.map((product: any) => ({
            ...product,
            category: categories_map_id_handle[product.category_id],
            featuredImage: product.images[0],
        }));

        return NextResponse.json({ products: formatted_products, categories });
    } catch (err: any) {
        console.error("❌ ERROR in /functions/data:", err);
        return NextResponse.json(
            { error: err.message ?? "unknown" },
            { status: 500 }
        );
    }
}