import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json({ message: 'Sesión cerrada correctamente' });
        response.cookies.delete('AuthToken');
        return response;
    } catch (error) {
        console.error('Error during logout:', error);
        if (error instanceof Error) {
            return NextResponse.json(
                { error: 'Error al cerrar sesión: ' + error.message },
                { status: 500 }
            );
        }
        return NextResponse.json(
            { error: 'Error desconocido al cerrar sesión' },
            { status: 500 }
        );
    }
}