import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        // Crear respuesta
        const response = NextResponse.json({ message: 'Sesión cerrada correctamente' });
        
        // Eliminar la cookie del navegador
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