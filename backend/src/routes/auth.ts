import { Request, Response, Router } from "express";
import multer from "multer";
import { DB } from "../lib/db";
import { Product, Category, ProductImage } from "../lib/entities";
import { ModelType, title_to_handle } from "../lib/util";
import {
  findOrThrow,
  handleImageUpload,
  handleReorderCategory,
  withErrorHandler,
} from "../lib/service";

const router = Router();
const upload = multer();

router.post("/image", upload.single("image"), handleImageUpload);

router.get(
  "/order/:id",
  withErrorHandler(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid order ID" });
    }

    const order = await findOrThrow(ModelType.order, id, ["items"]);
    res.json(order);
  }),
);

router.post(
  "/order/status",
  withErrorHandler(async (req, res) => {
    const { id, status } = req.body;

    const order = await findOrThrow(ModelType.order, id);
    order.status = status;

    const repo = DB.getRepository(ModelType.order);
    const saved = await repo.save(order);

    return res.json(saved);
  }),
);

router.get(
  "/orders",
  withErrorHandler(async (req: Request, res: Response) => {
    const orders = await DB.getRepository(ModelType.order)
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

    res.json(orders);
  }),
);

router.post(
  "/product/:add_or_id",
  withErrorHandler(async (req: Request, res: Response) => {
    const { add_or_id } = req.params;
    const body = req.body;
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
            imageRepo.create({
              ...img,
              position,
            }),
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
            imageRepo.create({
              ...img,
              product,
              position,
            }),
        );
        product = await productRepo.save(product);
      }

      await queryRunner.commitTransaction();
      return res
        .status(add_or_id === "add" ? 201 : 200)
        .json({ ...product, images });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }),
);

router.post(
  "/category/:add_or_id",
  withErrorHandler(async (req: Request, res: Response) => {
    const { add_or_id } = req.params;
    const body = req.body;
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
        return res.status(404).json({ error: "Category not found" });
      }
      instance = loaded;
    }

    const saved = await repo.save(instance);
    const final = await handleReorderCategory(repo, saved as Category);
    return res.status(add_or_id === "add" ? 201 : 200).json(final);
  }),
);

router.delete(
  "/:model/:id",
  withErrorHandler(async (req: Request, res: Response) => {
    const { model, id } = req.params;

    if (!["product", "category"].includes(model)) {
      return res.status(400).json({ error: "Unsupported model" });
    }

    const entity = await findOrThrow(model as ModelType, Number(id));
    const repo = DB.getRepository(model as ModelType);
    await repo.remove(entity);

    return res.status(200).json({ success: true });
  }),
);

export default router;
