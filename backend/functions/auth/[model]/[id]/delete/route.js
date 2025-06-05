export const dynamic = "force-dynamic";
import {NextResponse} from "next/server";
import {toHttpError} from "next-ecommerce-backend/lib/util";
import { requireAuthNext } from "next-ecommerce-backend/lib/service";

export async function DELETE(_req, {params}) {
    try {
        requireAuthNext(_req)
        const {DB} = await import("next-ecommerce-backend/lib/db");
        const {Product, Category} = await import("next-ecommerce-backend/lib/entities");

        if (!DB.isInitialized) {
            await DB.initialize();
        }

        if (!new Set(["product", "category"]).has(params.model)) {
            return NextResponse.json({ error: "Unsupported model" }, { status: 400 });
        }

        const repo = DB.getRepository(params.model === 'product' ? Product : Category);

        const entity = await repo.findOne({
            where: {id: params.id},
        });

        if (!entity) return NextResponse.json({error: "Entity not found"}, {status: 404});

        await repo.remove(entity);
        return NextResponse.json({success: true});
    } catch (error) {
        const err = toHttpError(error);
        return NextResponse.json({error: err.message}, {status: err.status});
    }
}
