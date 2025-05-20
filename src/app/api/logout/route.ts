import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { deleteSession } from "@/utils/Session";

export async function POST(request: Request) {
    try {
        // Obtener la cookie de sesión
        const sessionId = request.headers.get('cookie')?.split(';')
            .find(c => c.trim().startsWith('sessionId='))?.split('=')[1];
        
        if (sessionId) {
            await deleteSession(sessionId);
        }
        
        // Crear respuesta
        const response = NextResponse.json({ message: 'Sesión cerrada correctamente' });
        
        // Eliminar la cookie del navegador
        response.cookies.delete('sessionId');
        
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