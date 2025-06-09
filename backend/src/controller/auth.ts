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

    const safeFileName = path.basename(file.originalname);

    const resizedBuffer = await sharp(file.buffer)
      .resize(500, 500, {
        fit: "cover",
        position: "top",
      })
      .withMetadata({ orientation: undefined })
      .jpeg({ quality: 80 })
      .toBuffer();

    const blob = await put(`products/${safeFileName}`, resizedBuffer, {
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

  static async deleteEntity(model: ModelType, id: number) {
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
  }
}
