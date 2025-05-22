import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }
}