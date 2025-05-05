import { NextResponse } from "next/server";
import { deleteSession } from "@/utils/Session";
import { LeerCookie } from "@/utils/Tools.tsx";

export async function POST(_: Request) {
    try {
        const sessionId = LeerCookie('sessionId');
        if (!sessionId) {
            return NextResponse.json({ error: 'No se encontro una sesion' }, { status: 401 });
        }
        await deleteSession(sessionId);
        return NextResponse.json({})
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}