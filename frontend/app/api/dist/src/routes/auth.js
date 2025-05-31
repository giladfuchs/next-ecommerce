"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const db_1 = require("../lib/db");
const entities_1 = require("../lib/entities");
const util_1 = require("../lib/util");
const service_1 = require("../lib/service");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
router.post("/image", upload.single("image"), service_1.handleImageUpload);
router.get("/order/:id", (0, service_1.withErrorHandler)(async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid order ID" });
    }
    const order = await (0, service_1.findOrThrow)(util_1.ModelType.order, id, ["items"]);
    res.json(order);
}));
router.post("/order/status", (0, service_1.withErrorHandler)(async (req, res) => {
    const { id, status } = req.body;
    const order = await (0, service_1.findOrThrow)(util_1.ModelType.order, id);
    order.status = status;
    const repo = db_1.DB.getRepository(util_1.ModelType.order);
    const saved = await repo.save(order);
    return res.json(saved);
}));
router.get("/orders", (0, service_1.withErrorHandler)(async (req, res) => {
    const orders = await db_1.DB.getRepository(util_1.ModelType.order)
        .createQueryBuilder("order")
        .leftJoinAndSelect("order.items", "items")
        .orderBy(`
        CASE 
          WHEN order.status = 'new' THEN 1
          WHEN order.status = 'ready' THEN 2
          ELSE 3
        END
      `, "ASC")
        .addOrderBy("order.createdAt", "DESC")
        .getMany();
    res.json(orders);
}));
router.post("/product/:add_or_id", (0, service_1.withErrorHandler)(async (req, res) => {
    const { add_or_id } = req.params;
    const body = req.body;
    if (body.title) {
        body.handle = (0, util_1.title_to_handle)(body.title);
    }
    body.updatedAt = new Date();
    const { images, ...productData } = body;
    const queryRunner = db_1.DB.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const productRepo = queryRunner.manager.getRepository(entities_1.Product);
        const imageRepo = queryRunner.manager.getRepository(entities_1.ProductImage);
        let product;
        if (add_or_id === "add") {
            const newImages = (images || []).map((img, position) => imageRepo.create({
                ...img,
                position,
            }));
            product = productRepo.create({
                ...productData,
                images: newImages,
            });
            product = await productRepo.save(product);
        }
        else {
            product = await (0, service_1.findOrThrow)(util_1.ModelType.product, Number(add_or_id), [
                "images",
            ]);
            Object.assign(product, productData);
            await imageRepo.delete({ product });
            product.images = (images || []).map((img, position) => imageRepo.create({
                ...img,
                product,
                position,
            }));
            product = await productRepo.save(product);
        }
        await queryRunner.commitTransaction();
        return res
            .status(add_or_id === "add" ? 201 : 200)
            .json({ ...product, images });
    }
    catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
    }
    finally {
        await queryRunner.release();
    }
}));
router.post("/category/:add_or_id", (0, service_1.withErrorHandler)(async (req, res) => {
    const { add_or_id } = req.params;
    const body = req.body;
    body.updatedAt = new Date();
    if (body.title) {
        body.handle = (0, util_1.title_to_handle)(body.title);
    }
    const repo = db_1.DB.getRepository(entities_1.Category);
    let instance;
    if (add_or_id === "add") {
        instance = repo.create(body);
    }
    else {
        const loaded = await repo.preload({ id: Number(add_or_id), ...body });
        if (!loaded) {
            return res.status(404).json({ error: "Category not found" });
        }
        instance = loaded;
    }
    const saved = await repo.save(instance);
    const final = await (0, service_1.handleReorderCategory)(repo, saved);
    return res.status(add_or_id === "add" ? 201 : 200).json(final);
}));
router.delete("/:model/:id", (0, service_1.withErrorHandler)(async (req, res) => {
    const { model, id } = req.params;
    if (!["product", "category"].includes(model)) {
        return res.status(400).json({ error: "Unsupported model" });
    }
    const entity = await (0, service_1.findOrThrow)(model, Number(id));
    const repo = db_1.DB.getRepository(model);
    await repo.remove(entity);
    return res.status(200).json({ success: true });
}));
exports.default = router;
//# sourceMappingURL=auth.js.map