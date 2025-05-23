import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

interface SubjectRef {
    category: string;
    code: string;
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);

        const collection = await getCollection("users");
        const teacher = await collection.findOne({ _id: new ObjectId(userId) });
        if (!teacher) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        return NextResponse.json({
            name: teacher.username,
            image: teacher.data.image_path,
            description: teacher.data.description,
            subjects: teacher.data.subjects
        });
    } catch (error) {
        console.error('Error al obtener datos del profesor:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        const { name, description, subjects }: { name: string; description: string; subjects: SubjectRef[] } = await request.json();
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(userId) },
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