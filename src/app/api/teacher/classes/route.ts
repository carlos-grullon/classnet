import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormData } from "@/interfaces";
import { getSession } from "@/utils/Session";

export async function PUT(request: NextRequest) {
    try {
        const IdSession = request.cookies.get('IdSession')!.value;
        const userData = await getSession(IdSession);
        console.log(userData);
        return NextResponse.json({ error: 'No se encontro una sesion' }, { status: 401 });
        const { classData }: { classData: ClassFormData } = await request.json();
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { idSession: IdSession },
            { 
                $push: { 
                    'data.classes': classData
                } as any
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