import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const email = data.email;
        
        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }
        
        // Obtener la colección de profesores
        const collection = await getCollection("users");
        
        // Buscar al profesor por email
        const teacher = await collection.findOne({ email: email });
        
        if (!teacher) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        
        // Devolver los datos del profesor
        return NextResponse.json({
            name: teacher.username,
            email: teacher.email,
            data: teacher.data
        });
    } catch (error) {
        console.error('Error al obtener datos del profesor:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}
