import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { SearchClassSchema } from '@/validations/classSearch';
import { ClassDatabase } from '@/interfaces/Class';
import { z } from 'zod';
import { mongoTimeToTimeString12h } from "@/utils/Tools.ts";

export async function POST(request: NextRequest) {
    try {
        const { page = 0, ...data } = await request.json();
        
        // Validar datos nuevamente
        const validatedData = SearchClassSchema.parse(data);
        
        const offset = page * 20;
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
                total: [
                    { $count: "count" }
                ]
            } }
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
            page,
            totalPages
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ errors: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
