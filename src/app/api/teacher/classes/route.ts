import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormData } from "@/interfaces";

export async function PUT(request: Request) {
    try {
        const { email, classData }: { email: string; classData: ClassFormData } = await request.json();
        
        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { email: email },
            { 
                $push: { 
                    'data.classes': classData
                } as any // Necesario temporalmente para el tipado
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Clase agregada correctamente',
            updatedFields: { classData }
        });
        
    } catch (error) {
        console.error('Error al agregar la clase:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}