import { Request, Response, Router } from "express";

import {
  withErrorHandler,
} from "../lib/service";
import {getData, checkout, login} from "../controller/public";

const router = Router();

// Submit order using cart data as-is (no price validation against DB)
router.post(
    "/checkout",
    withErrorHandler(async (req: Request, res: Response) => {
        const order = await checkout(req.body);
        res.status(201).json(order);
    }),
);
router.get(
  "/data",
  withErrorHandler(async (req: Request, res: Response) => {
      const { products, categories } = await getData();
      res.json({ products, categories });
  }),
);

router.post(
    "/login",
    withErrorHandler(async (req, res) => {
        const result = await login(req.body);
        res.json(result);
    }),
);

export default router;
