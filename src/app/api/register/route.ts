import { NextResponse } from "next/server";
import { Register } from "@/model/Auth";
import { createSession } from "@/utils/Session";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        if (data.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres.');
        }
        await Register(
            data.username,
            data.password,
            data.user_type,
            data.email
        )
        const idSession = await createSession('', data);
        return NextResponse.json({ idSession: idSession });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}