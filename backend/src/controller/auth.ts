import { DB } from "../lib/db";
import {Product, Category, ProductImage, Order} from "../lib/entities";
import { ModelType, title_to_handle } from "../lib/util";
import { findOrThrow, handleReorderCategory } from "../lib/service";
import { HttpError } from "../lib/util";

export class AuthController {
    static async getOrder(id: string) {
        const parse_id = Number(id);

        if (isNaN(parse_id)) {
            throw new HttpError(400, "Invalid order ID");
        }

        return await findOrThrow(ModelType.order, parse_id, ["items"]);
    }

    static async updateOrderStatus(body: any) {
        const { id, status } = body;

        const order = await findOrThrow(ModelType.order, id);
        order.status = status;

        const repo = DB.getRepository(Order);
        return await repo.save(order);
    }

    static async getOrders() {
        return await DB.getRepository(Order)
            .createQueryBuilder("order")
            .leftJoinAndSelect("order.items", "items")
            .orderBy(
                `
        CASE 
          WHEN order.status = 'new' THEN 1
          WHEN order.status = 'ready' THEN 2
          ELSE 3
        END
      `,
                "ASC",
            )
            .addOrderBy("order.createdAt", "DESC")
            .getMany();
    }

    static async saveProduct(add_or_id: string, body: any) {
        if (body.title) {
            body.handle = title_to_handle(body.title);
        }
        body.updatedAt = new Date();

        const { images, ...productData } = body;

        const queryRunner = DB.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const productRepo = queryRunner.manager.getRepository(Product);
            const imageRepo = queryRunner.manager.getRepository(ProductImage);

            let product: Product;

            if (add_or_id === "add") {
                const newImages = (images || []).map((img: ProductImage, position: number) =>
                    imageRepo.create({ ...img, position }),
                );

                product = productRepo.create({
                    ...(productData as Partial<Product>),
                    images: newImages,
                });

                product = await productRepo.save(product);
            } else {
                product = await findOrThrow(ModelType.product, Number(add_or_id), ["images"]);
                Object.assign(product, productData);

                await imageRepo.delete({ product });

                product.images = (images || []).map((img: ProductImage, position: number) =>
                    imageRepo.create({ ...img, product, position }),
                );

                product = await productRepo.save(product);
            }

            await queryRunner.commitTransaction();
            return { ...product, images };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    static async saveCategory(add_or_id: string, body: any) {
        body.updatedAt = new Date();
        if (body.title) {
            body.handle = title_to_handle(body.title);
        }

        const repo = DB.getRepository(Category);
        let instance: Category;

        if (add_or_id === "add") {
            instance = repo.create(body as Category);
        } else {
            const loaded = await repo.preload({ id: Number(add_or_id), ...body });
            if (!loaded) {
                throw new HttpError(404, "Category not found");
            }
            instance = loaded;
        }

        const saved = await repo.save(instance);
        return await handleReorderCategory(repo, saved as Category);
    }

    static async deleteEntity(model: string, id: number) {
        if (!["product", "category"].includes(model)) {
            throw new HttpError(400, "Unsupported model");
        }

        const entity = await findOrThrow(model as ModelType, id);
        const repo = DB.getRepository(model as ModelType);
        await repo.remove(entity);

        return { success: true };
    }
}