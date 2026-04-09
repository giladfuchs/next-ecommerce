import { VercelRequest, VercelResponse } from "@vercel/node";
import app from "./app";

export default function handler(req: VercelRequest, res: VercelResponse) {
  app(req as any, res as any);
}
