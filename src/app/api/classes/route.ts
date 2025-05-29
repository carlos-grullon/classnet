import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassSchema } from '@/validations/classSearch';
import { ClassDatabase } from '@/interfaces/Class';
import { z } from 'zod';
import { mongoTimeToTimeString12h } from "@/utils/Tools.ts";
import { getUserId } from "@/utils/Tools.ts";
import { ClassFormValues } from "@/validations/class";
import { timeStringToMongoTime } from "@/utils/Tools.ts";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        
        const rawData = {
            subject: searchParams.get('subject') || '',
            teacher_id: searchParams.get('teacher_id') || '',
            minPrice: searchParams.get('minPrice') || '0',
            maxPrice: searchParams.get('maxPrice') || '0',
            level: searchParams.get('level') || '',
            days: searchParams.getAll('days'),
            page: searchParams.get('page') || '0'
        };

        const validatedData = SearchClassSchema.parse({
            ...rawData,
            minPrice: Number(rawData.minPrice),
            maxPrice: Number(rawData.maxPrice),
            page: Number(rawData.page)
        });

        const offset = validatedData.page * 20;
        const limit = 20;

        const collection = await getCollection("classes");

        const result = await collection.aggregate([
            { $match: {
                subject: validatedData.subject === '' ? { $exists: true } : validatedData.subject,
                user_id: validatedData.teacher_id === '' ? { $exists: true } : new ObjectId(validatedData.teacher_id),
                price: { 
                    $gte: validatedData.minPrice,
                    $lte: validatedData.maxPrice === 0 ? Infinity : validatedData.maxPrice
                },
                level: validatedData.level === '' ? { $exists: true } : validatedData.level,
                selectedDays: validatedData.days.length > 0 ? { $in: validatedData.days } : { $exists: true }
            } },
            { $facet: {
                data: [
                    { $skip: offset },
                    { $limit: limit }
                ],
                total: [{ $count: "count" }]
            }}
        ]).toArray();
        
        const classes = result[0]?.data || [];
        const total = result[0]?.total[0]?.count || 0;
        const totalPages = Math.ceil(total / limit);

        // Conseguir el nommbre de las materias y del profesor
        const userCollection = await getCollection("users");
        const subjectCollection = await getCollection("subjects");

        // Convertir a formato legible para el front
        const formattedClasses = await Promise.all(classes.map(async (classItem: ClassDatabase) => {
            const [teacher, subject] = await Promise.all([
                userCollection.findOne({ _id: classItem.user_id }, { projection: { username: 1 } }).then(res => res?.username),
                (async () => {
                    const [category, code] = classItem.subject.split('-');
                    const subjectDoc = await subjectCollection.findOne({ category, code }, { projection: { name: 1 } });
                    return subjectDoc?.name;
                })()
            ]);

            return {
                ...classItem,
                _id: classItem._id.toString(),
                user_id: classItem.user_id.toString(),
                selectedDays: classItem.selectedDays.sort((a, b) => parseInt(a) - parseInt(b)),
                startTime: mongoTimeToTimeString12h(classItem.startTime),
                endTime: mongoTimeToTimeString12h(classItem.endTime),
                teacher: teacher || 'Profesor no disponible',
                subject: subject || classItem.subject
            };
        }));
        
        return NextResponse.json({ 
            classes: formattedClasses,
            total,
            page: validatedData.page,
            totalPages
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        const userCollection = await getCollection("users");
        const teacher = await userCollection.findOne({ _id: new ObjectId(userId) });
        
        const { classData }: { classData: ClassFormValues } = await request.json();

        if (!classData) {
            return NextResponse.json({ error: 'Datos no enviados' }, { status: 400 });
        }

        const collection = await getCollection("classes");
        
        const insertedClass = await collection.insertOne({
            teacher_id: new ObjectId(userId),
            subject_id: new ObjectId(classData.subject._id),
            subjectName: classData.subject.name,
            teacherName: teacher!.username,
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