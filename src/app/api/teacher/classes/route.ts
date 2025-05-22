import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormData } from "@/interfaces";

export async function PUT(request: Request) {
    try {
        const { email, classes }: { email: string; classes: ClassFormData[] } = await request.json();
        
        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { email: email },
            { 
                $set: { 
                    'data.classes': classes
                } 
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Clases agregadas correctamente',
            updatedFields: { classes }
        });
        
    } catch (error) {
        console.error('Error al agregar las clases:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}