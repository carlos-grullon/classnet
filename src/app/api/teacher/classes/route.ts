import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { ClassFormValues } from "@/validations/class";
import { getUserId } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";
import { timeStringToMongoTime, mongoTimeToTimeString12h } from "@/utils/Tools.ts";

export async function PUT(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        
        const { classData }: { classData: ClassFormValues } = await request.json();

        if (!classData) {
            return NextResponse.json({ error: 'Datos no enviados' }, { status: 400 });
        }

        const collection = await getCollection("classes");
        
        const insertedClass = await collection.insertOne({
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
        
        if (!insertedClass.insertedId) {
            return NextResponse.json({ error: 'Error al crear la clase' }, { status: 404 });
        }
        // Obtener el documento completo recién creado
        const newClass = await collection.findOne({ _id: insertedClass.insertedId });
        if (!newClass) {
            return NextResponse.json({ error: 'Error al obtener la clase' }, { status: 404 });
        }
        // Formatear los tiempos a formato 12h y ordenar los días
        newClass.startTime = mongoTimeToTimeString12h(newClass.startTime);
        newClass.endTime = mongoTimeToTimeString12h(newClass.endTime);
        newClass.selectedDays = newClass.selectedDays.sort((a: string, b: string) => parseInt(a) - parseInt(b));
        return NextResponse.json({ 
            success: true,
            message: 'Clase agregada correctamente',
            classCreated: newClass
        });
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}