import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormData } from "@/interfaces";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";
import { timeStringToMongoTime } from "@/utils/Tools.ts";

export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        
        const { classData }: { classData: ClassFormData } = await request.json();

        if (!classData) {
            return NextResponse.json({ error: 'Datos no enviados' }, { status: 400 });
        }

        const collection = await getCollection("classes");
        
        const updateResult = await collection.insertOne({
            user_id: new ObjectId(userId),
            subject: classData.subject,
            startTime: timeStringToMongoTime(classData.startTime),
            endTime: timeStringToMongoTime(classData.endTime),
            selectedDays: classData.selectedDays,
            maxStudents: classData.maxStudents,
            price: classData.price,
            level: classData.level,
            students: [],
            status: 'A',
            created_at: new Date(),
            updated_at: new Date()
        });
        
        if (!updateResult.insertedId) {
            return NextResponse.json({ error: 'Error al crear la clase' }, { status: 404 });
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