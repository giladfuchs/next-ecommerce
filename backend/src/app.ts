import "reflect-metadata";

import express from "express";
import cors from "cors";
import routes from "./routes";
import { initDBMiddleware } from "./lib/db";

const app = express();

// If running locally, allow all origins
const allowedOrigins =
    process.env.NODE_ENV === "development"
        ? "*"
        : process.env.ALLOWED_ORIGINS?.split(",");

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
