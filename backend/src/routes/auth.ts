import { Request, Response, Router } from "express";
import multer from "multer";
import { AuthController } from "../controller/auth";
import {handleImageUpload, withErrorHandler} from "../lib/service";

const router = Router();
const upload = multer();

router.post("/image", upload.single("image"), handleImageUpload);


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
        const result = await AuthController.deleteEntity(model, Number(id));
        res.status(200).json(result);
    }),
);

export default router;