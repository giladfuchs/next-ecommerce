import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// curl -X GET http://localhost:3344/preview/reset
export async function GET() {
  try {
    const { default: SeedService } = await import("seed");
    await new SeedService("reset").run();

    return NextResponse.json({
      success: true,
      message: "Data reset successfully",
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message.slice(0, 200)
        : String(err).slice(0, 200);

    return NextResponse.json(
      {
        success: false,
        message: "Reset failed",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
