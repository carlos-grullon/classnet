import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormData } from "@/interfaces";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        
        const { classData }: { classData: ClassFormData } = await request.json();
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(userId) },
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
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}