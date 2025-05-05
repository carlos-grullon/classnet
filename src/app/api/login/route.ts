import { NextResponse } from "next/server";
import { Login } from "@/app/model/Auth";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const user = await Login(
            data.password,
            data.email
        )
        return NextResponse.json({user});
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}