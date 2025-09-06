import "reflect-metadata";

import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDBMiddleware } from "./lib/db";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",");
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

app.use(initDBMiddleware);
app.use("/", routes);

export default app;
