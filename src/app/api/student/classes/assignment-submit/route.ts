import { NextRequest, NextResponse } from 'next/server';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';

type SubmissionData = {
    classId: string;
    weekNumber: number;
    day: string; // día seleccionado (coincide con selectedDaysRaw)
    fileUrl?: string;
    fileName?: string;
    audioUrl?: string;
    message?: string;
};


export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId(request);
        const data: SubmissionData = await request.json();

        // Validaciones básicas
        if (!data.classId || !data.weekNumber || !data.day) {
            return NextResponse.json(
                { error: 'classId, weekNumber y day son requeridos' },
                { status: 400 }
            );
        }
        // Permitir archivo, audio o mensaje (al menos uno)
        if (!data.fileUrl && !data.audioUrl && !data.message) {
            return NextResponse.json(
                { error: 'Se requiere al menos archivo, audio o mensaje' },
                { status: 400 }
            );
        }

        // Estructura de la entrega por día
        const daySubmission = {
            fileUrl: data.fileUrl || null,
            audioUrl: data.audioUrl || null,
            fileName: data.fileName || null,
            message: data.message || '',
            fileSubmittedAt: data.fileUrl ? new Date() : null,
            audioSubmittedAt: data.audioUrl ? new Date() : null
        };

        const submittedAssignmentsCollection = await getCollection('submittedAssignments');

        // Verificar si existe documento raíz por estudiante/semana/clase
        const rootFilter = {
            weekNumber: data.weekNumber,
            studentId: new ObjectId(userId),
            classId: new ObjectId(data.classId)
        };

        const existingSubmission = await submittedAssignmentsCollection.findOne(rootFilter);

        if (existingSubmission) {
            // Sobrescribir la entrega del día indicado
            await submittedAssignmentsCollection.updateOne(
                { _id: existingSubmission._id },
                {
                    $set: {
                        [`days.${data.day}`]: daySubmission,
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            // Crear documento raíz con el día enviado
            await submittedAssignmentsCollection.insertOne({
                classId: new ObjectId(data.classId),
                studentId: new ObjectId(userId),
                weekNumber: data.weekNumber,
                days: {
                    [data.day]: daySubmission
                },
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        return NextResponse.json({
            success: true
        });

    } catch (error) {
        console.error('Error submitting assignment:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}