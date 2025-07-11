import { NextRequest, NextResponse } from "next/server";
import { resetDemoManually } from "@/utils/resetDemo";

export async function POST(req: NextRequest) {
    try {
        await resetDemoManually();
        return NextResponse.json({ success: true, message: "Demo reset done" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al resetear la demo';
        console.error(message, error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
