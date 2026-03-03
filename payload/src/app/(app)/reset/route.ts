import { NextResponse } from "next/server";
import { run_seed_reset } from "seed/seedData";

export async function GET() {
  try {
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

    console.error("❌ Reset failed:", errorMessage);

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
