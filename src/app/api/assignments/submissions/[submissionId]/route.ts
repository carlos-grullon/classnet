import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/utils/MongoDB.ts';

// api/assignments/submissions/[submissionId] GET para obtener detalles de una entrega
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ submissionId: string }> }
): Promise<NextResponse> {
    try {
        const submissionId = (await params).submissionId;
        const submissionsCollection = await getCollection('submittedAssignments');

        // Validar ID
        if (!ObjectId.isValid(submissionId)) {
            return NextResponse.json(
                { error: 'ID de envío inválido' },
                { status: 400 }
            );
        }

        // Buscar la asignación
        const submission = await submissionsCollection.aggregate([
            {
                $match: {
                    _id: new ObjectId(submissionId)
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            {
                $unwind: '$student'
            },
            {
                $addFields: {
                    studentName: '$student.username'
                }
            }
        ]).next();

        if (!submission) {
            return NextResponse.json(
                { error: 'No se encontró la asignación' },
                { status: 404 }
            );
        }
        return NextResponse.json({ success: true, data: submission });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener detalles';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
