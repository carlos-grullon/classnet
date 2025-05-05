import { NextResponse } from "next/server";
import { LeerCookie, CrearCookie, EliminarCookie } from "@/utils/Tools.ts";
import {
    getSession,
    createSession,
    setSession,
    deleteSession
} from "@/utils/Session";

export async function GET(request: Request) {
    try {
        const idSession = LeerCookie(request, 'sessionId');
        if (!idSession) {
            return NextResponse.json({ error: 'No se encontro una sesion' }, { status: 401 });
        }
        const session = await getSession(idSession);
        if (!session) {
            return NextResponse.json({ error: "No se encontro una sesion" }, { status: 401 });
        }
        return NextResponse.json({ sessionValue: session })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const idSession = await createSession('', data)
        CrearCookie('sessionId', idSession);
        return NextResponse.json({ idSession: idSession })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export async function UPDATE(request: Request) {
    try {
        const data = await request.json();
        const idSession = LeerCookie(request, 'sessionId');
        if (!idSession) {
            return NextResponse.json({ error: 'No se encontro una sesion' }, { status: 401 });
        }
        await setSession(idSession, data);
        return NextResponse.json({})
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}

export async function DELETE(request: Request) {
    try {
        const idSession = LeerCookie(request, 'sessionId');
        if (!idSession) {
            return NextResponse.json({ error: 'No se encontro una sesion' }, { status: 401 });
        }
        await deleteSession(idSession);
        EliminarCookie('sessionId');
        return NextResponse.json({})
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}