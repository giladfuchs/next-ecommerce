import path from "path";
import sharp from "sharp";
import { put } from "@vercel/blob";
import { DB } from "../lib/db";
import { Product, Category, ProductImage, Order } from "../lib/entities";
import { ModelType, title_to_handle } from "../lib/util";
import { findOrThrow, handleReorderCategory } from "../lib/service";
import { HttpError } from "../lib/util";

export class AuthController {
  static async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new HttpError(400, "No image uploaded");
    }

    if (!file.mimetype.startsWith("image/")) {
      throw new HttpError(400, "Only image files are allowed");
    }

    const baseName = path.parse(file.originalname).name;
    const fileName = `${baseName}-${Date.now()}.webp`;
    const optimizedBuffer = await sharp(file.buffer)
      .rotate()
      .resize(500, 500, {
        fit: "cover",
        position: "top",
      })
      .webp({
        quality: 82,
        effort: 4,
      })
      .toBuffer();
    const blob = await put(`products/${fileName}`, optimizedBuffer, {
      access: "public",
      allowOverwrite: true,
    });

    return { url: blob.url };
  }

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
    return await DB.createQueryBuilder(Order, "order")
      .leftJoinAndSelect("order.items", "items")
      .orderBy(
        `CASE 
          WHEN order.status = 'new' THEN 1
          WHEN order.status = 'ready' THEN 2
          ELSE 3
        END`,
        "ASC",
      )
      .addOrderBy("order.createdAt", "DESC")
      .getMany();
  }

  static saveProduct = this.withRevalidate(
    async (
      add_or_id: string,
      body: Record<string, unknown>,
    ): Promise<Product & { images: ProductImage[] }> => {
      if (body.title) {
        (body as { handle?: string }).handle = title_to_handle(
          body.title as string,
        );
      }
      (body as { updatedAt: Date }).updatedAt = new Date();

      const { images, ...productData } = body as {
        images?: ProductImage[];
      };

      const queryRunner = DB.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        const productRepo = queryRunner.manager.getRepository(Product);
        const imageRepo = queryRunner.manager.getRepository(ProductImage);

        let product: Product;

        if (add_or_id === "add") {
          const newImages = (images || []).map(
            (img: ProductImage, position: number) =>
              imageRepo.create({ ...img, position }),
          );

          product = productRepo.create({
            ...(productData as Partial<Product>),
            images: newImages,
          });

          product = await productRepo.save(product);
        } else {
          product = await findOrThrow(ModelType.product, Number(add_or_id), [
            "images",
          ]);
          Object.assign(product, productData);

          await imageRepo.delete({ product });

          product.images = (images || []).map(
            (img: ProductImage, position: number) =>
              imageRepo.create({ ...img, product, position }),
          );

          product = await productRepo.save(product);
        }

        await queryRunner.commitTransaction();
        return { ...product, images: images || [] };
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    },
  );

  static saveCategory = this.withRevalidate(
    async (
      add_or_id: string,
      body: Record<string, unknown>,
    ): Promise<Category> => {
      (body as { updatedAt: Date }).updatedAt = new Date();

      if (body.title) {
        (body as { handle?: string }).handle = title_to_handle(
          body.title as string,
        );
      }

      const repo = DB.getRepository(Category);
      let instance: Category;

      if (add_or_id === "add") {
        instance = repo.create(body as Partial<Category>);
      } else {
        const loaded = await repo.preload({
          id: Number(add_or_id),
          ...(body as Partial<Category>),
        });
        if (!loaded) {
          throw new HttpError(404, "Category not found");
        }
        instance = loaded;
      }

      const saved = await repo.save(instance);
      return await handleReorderCategory(repo, saved as Category);
    },
  );

  static deleteEntity = this.withRevalidate(
    async (model: ModelType, id: number): Promise<{ success: boolean }> => {
      if (
        !new Set<ModelType>([ModelType.product, ModelType.category]).has(model)
      ) {
        throw new HttpError(400, "Unsupported model");
      }

      const entity = await findOrThrow(model, id);
      const repo = DB.getRepository(
        model === ModelType.product ? Product : Category,
      );

      await repo.remove(entity);

      return { success: true };
    },
  );

  private static async revalidateStore(): Promise<void> {
    try {
      await fetch(`${process.env.STORE_BASE_URL}/revalidate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: process.env.REVALIDATE_SECRET,
        }),
      });
    } catch {
      // silent
    }
  }
  private static withRevalidate<Args extends unknown[], R>(
    fn: (...args: Args) => Promise<R>,
  ): (...args: Args) => Promise<R> {
    return async (...args: Args): Promise<R> => {
      const result = await fn.apply(this, args);
      await this.revalidateStore();
      return result;
    };
  }
}
