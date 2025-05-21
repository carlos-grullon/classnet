import { NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";

interface SubjectRef {
    category: string;
    code: string;
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const email = data.email;
        const collection = await getCollection("users");
        const teacher = await collection.findOne({ email: email });
        if (!teacher) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
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

export async function PUT(request: Request) {
    try {
        const { email, name, description, subjects }: { email: string; name: string; description: string; subjects: SubjectRef[] } = await request.json();
        
        if (!email) {
            return NextResponse.json({ error: 'Email es requerido' }, { status: 400 });
        }
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { email: email },
            { 
                $set: { 
                    username: name,
                    'data.description': description,
                    'data.subjects': subjects
                } 
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Perfil actualizado correctamente',
            updatedFields: { name, description, subjects }
        });
        
    } catch (error) {
        console.error('Error al actualizar datos del profesor:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}