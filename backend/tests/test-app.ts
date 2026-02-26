import "reflect-metadata";
import express from "express";
import cors from "cors";
import routes from "../src/routes";

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

app.use("/", routes);

export default app;
