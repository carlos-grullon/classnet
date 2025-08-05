import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const token = request.cookies.get('AuthToken')?.value;
    if (!token) return NextResponse.json({ error: 'No token found' }, { status: 401 });
    return NextResponse.json({token});
}