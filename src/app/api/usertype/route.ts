import { NextResponse, NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function POST(request: NextRequest) {
    try {
        // Obtiene el token del cookie
        const token = request.cookies.get('AuthToken')?.value;
        if (!token) throw new Error('No token found');

        // Verifica el token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);

        if (!payload.userId || typeof payload.userId !== 'string') {
            throw new Error('Invalid token payload');
        }
        // Retorna el tipo de usuario
        return NextResponse.json({
            isStudent: payload.userIsStudent,
            isTeacher: payload.userIsTeacher
        });
    } catch (error) {
        console.error('Error al obtener tipo de usuario:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}