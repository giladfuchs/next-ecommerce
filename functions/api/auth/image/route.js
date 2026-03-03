export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { toHttpError } from "next-ecommerce-backend/lib/util";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileObject = {
      buffer,
      originalname: file.name,
      mimetype: file.type,
    };
    const { AuthController } = await import("next-ecommerce-backend/controller/auth");

    const result = await AuthController.uploadImage(fileObject);
    return NextResponse.json(result);
  } catch (error) {
    const err = toHttpError(error);
    return NextResponse.json({ error: err.message }, { status: err.status });
  }
}