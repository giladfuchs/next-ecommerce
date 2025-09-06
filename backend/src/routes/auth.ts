import { Request, Response, Router } from "express";
import multer from "multer";
import { AuthController } from "../controller/auth";
import { withErrorHandler } from "../lib/service";
import { HttpError, ModelType } from "../lib/util";

const router = Router();
const upload = multer();

router.post("/image", upload.single("image"), async (req, res) => {
  try {
    const result = await AuthController.uploadImage(req.file!);
    res.json(result);
  } catch (err) {
    if (err instanceof HttpError) {
      res.status(err.status).json({ error: err.message });
    } else {
      console.error("❌ Unexpected upload error:", err);
      res.status(500).json({
        error: "Upload failed",
        message: err instanceof Error ? err.message : String(err),
      });
    }
  }
});

router.get(
  "/order/:id",
  withErrorHandler(async (req: Request, res: Response) => {
    const order = await AuthController.getOrder(req.params.id);
    res.json(order);
  }),
);

router.post(
  "/order/status",
  withErrorHandler(async (req, res) => {
    const updated = await AuthController.updateOrderStatus(req.body);
    res.json(updated);
  }),
);

router.get(
  "/orders",
  withErrorHandler(async (_req: Request, res: Response) => {
    const orders = await AuthController.getOrders();
    res.json(orders);
  }),
);

router.post(
  "/product/:add_or_id",
  withErrorHandler(async (req: Request, res: Response) => {
    const { add_or_id } = req.params;
    const result = await AuthController.saveProduct(add_or_id, req.body);
    return res.status(add_or_id === "add" ? 201 : 200).json(result);
  }),
);

router.post(
  "/category/:add_or_id",
  withErrorHandler(async (req: Request, res: Response) => {
    const { add_or_id } = req.params;
    const result = await AuthController.saveCategory(add_or_id, req.body);
    return res.status(add_or_id === "add" ? 201 : 200).json(result);
  }),
);

router.delete(
  "/:model/:id/delete",
  withErrorHandler(async (req: Request, res: Response) => {
    const { model, id } = req.params;
    const result = await AuthController.deleteEntity(
      model as ModelType,
      Number(id),
    );
    res.status(200).json(result);
  }),
);

export default router;
