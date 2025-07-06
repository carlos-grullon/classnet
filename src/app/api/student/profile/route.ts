import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

interface StudentUpdate {
    name: string,
    description: string,
    country: string,
    number: string
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        const collection = await getCollection("users");
        const student = await collection.findOne({ _id: new ObjectId(userId) });
        if (!student) {
            return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
        }
        const response = {
            name: student.username,
            image: student.image_path,
            description: student.description,
            country: student.country,
            number: student.number
        };
        return NextResponse.json(response);
    } catch (error) {
        console.error('Error al obtener datos del estudiante:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        const { name, description, country, number }: StudentUpdate = await request.json();
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    username: name,
                    description: description,
                    country: country,
                    updated_at: new Date(),
                    number: number
                } 
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Perfil actualizado correctamente',
            updatedFields: { name, description, country, number }
        });
        
    } catch (error) {
        console.error('Error al actualizar datos del estudiante:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}