import { NextResponse } from "next/server";
import { Login } from "@/model/Auth";
import { createSession } from "@/utils/Session";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const users = await Login(
            data.password,
            data.email,
            data.user_type || 'A'
        )

        if (users.length === 1) {
            const idSession = await createSession('', users[0]);
            return NextResponse.json({ idSession: idSession, TwoAccountsFound: false });
        }
        return NextResponse.json({ TwoAccountsFound: true })
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}