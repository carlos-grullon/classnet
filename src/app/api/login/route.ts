import { NextResponse } from "next/server";
import { Login } from "@/model/Auth";
import { createSession } from "@/utils/Session";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await Login(
            data.password,
            data.email
        )

        const idSession = await createSession('', user);
        return NextResponse.json({ idSession: idSession });
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}