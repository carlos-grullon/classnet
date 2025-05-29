import { NextResponse, NextRequest } from "next/server";
import { getCollection } from "@/utils/MongoDB";
import { getUserId, mongoTimeToTimeString12h } from "@/utils/Tools.ts";
import { ObjectId } from "mongodb";

interface SubjectRef {
    category: string;
    code: string;
}

export async function GET(request: NextRequest) {
    try {
        // Busca los datos del profesor.
        const userId = await getUserId(request);
        const collection = await getCollection("users");
        const teacher = await collection.findOne({ _id: new ObjectId(userId) });
        if (!teacher) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        const response: any = {
            name: teacher.username,
            image: teacher.image_path,
            description: teacher.description,
            subjects: teacher.data.subjects,
            country: teacher.country
        };
        const { searchParams } = new URL(request.url);
        const needClasses = searchParams.get('needClasses') === 'true';
        if (needClasses) {
            const ClassesCollection = await getCollection("classes");
            const classes = await ClassesCollection.find({ teacher_id: new ObjectId(userId) }).toArray();
            if (classes.length > 0) {
                response.classes = classes.map(cls => ({
                    ...cls,
                    startTime: mongoTimeToTimeString12h(cls.startTime),
                    endTime: mongoTimeToTimeString12h(cls.endTime),
                    selectedDays: cls.selectedDays.sort((a: string, b: string) => parseInt(a) - parseInt(b))
                }));
            }
        }
        return NextResponse.json(response);
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
        const { name, description, subjects, country }: { name: string; description: string; subjects: SubjectRef[]; country: string } = await request.json();
        
        const collection = await getCollection("users");
        
        const updateResult = await collection.updateOne(
            { _id: new ObjectId(userId) },
            { 
                $set: { 
                    username: name,
                    description : description,
                    data: {
                        subjects: subjects
                    },
                    country: country,
                    updated_at: new Date()
                } 
            }
        );
        
        if (updateResult.matchedCount === 0) {
            return NextResponse.json({ error: 'Profesor no encontrado' }, { status: 404 });
        }
        
        return NextResponse.json({ 
            success: true,
            message: 'Perfil actualizado correctamente',
            updatedFields: { name, description, subjects, country }
        });
        
    } catch (error) {
        console.error('Error al actualizar datos del profesor:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
    }
}