import { NextResponse } from 'next/server';
import { handleGetPublicData } from 'api/src/controller/public';
import {DB} from "api/src/lib/db";

export async function GET() {
    if (!DB.isInitialized) {
        await DB.initialize();
    }
    const data = await handleGetPublicData();
    return NextResponse.json(data);
}