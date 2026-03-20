import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { run_seed_reset } = await import("seed/seedData");
    await run_seed_reset("reset");

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
