import { Router } from "express";
import authRouter from "./auth";
import publicRouter from "./public";
import { authMiddleware } from "../lib/service";

const router = Router();
router.use("/", publicRouter);
router.use("/auth", authMiddleware, authRouter);

export default router;
