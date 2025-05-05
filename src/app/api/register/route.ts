import { NextResponse } from "next/server";
import { Register } from "@/app/model/Auth";

export async function POST(request: Request) {
    try {
    const data = await request.json();
    const newUser = await Register(
        data.username,
        data.password,
        data.user_type,
        data.email
    )
    return NextResponse.json(newUser);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}