import { Request, Response, Router } from "express";

import { withErrorHandler } from "../lib/service";
import { PublicController } from "../controller/public";

const router = Router();

// Submit order using cart data as-is (no price validation against DB)
router.post(
  "/checkout",
  withErrorHandler(async (req: Request, res: Response) => {
    const order = await PublicController.checkout(req.body);
    res.status(201).json(order);
  }),
);
router.get(
  "/data",
  withErrorHandler(async (req: Request, res: Response) => {
    const { products, categories } = await PublicController.getData();
    res.json({ products, categories });
  }),
);

router.post(
  "/login",
  withErrorHandler(async (req, res) => {
    const result = await PublicController.login(req.body);
    res.json(result);
  }),
);
router.post(
  "/register",
  withErrorHandler(async (req, res) => {
    const result = await PublicController.register(req.body);
    res.json(result);
  }),
);
router.get(
  "/reset_mock_db",
  withErrorHandler(async (req, res) => {
    const result = await PublicController.resetMockDb();
    res.json(result);
  }),
);
export default router;
