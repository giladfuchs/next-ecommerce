import { NextResponse } from 'next/server';
import { config } from 'dotenv';
import path from 'path';

config({ path: path.resolve(process.cwd(), '../.env') });


export async function GET() {
    try {
        console.log("🟨 GET /api/data");

        const { DB } = await import('../dist/src/lib/db.js');
        const { Product, Category } = await import('../dist/src/lib/entities.js');

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        const [products, categories] = await Promise.all([
            DB.getRepository(Product).find({
                relations: ['images'],
                order: { updatedAt: 'DESC', images: { position: 'ASC' } },
            }),
            DB.getRepository(Category).find({ order: { position: 'ASC' } }),
        ]);

        const categoriesMap = Object.fromEntries(categories.map(c => [c.id, c.handle]));

        const formattedProducts = products.map((p: any) => ({
            ...p,
            category: categoriesMap[p.category_id],
            featuredImage: p.images[0],
        }));

        return NextResponse.json({ products: formattedProducts, categories });
    } catch (err: any) {
        console.error('❌ ERROR in /api/data:', err);
        return NextResponse.json({ error: err.message ?? 'unknown' }, { status: 500 });
    }
}