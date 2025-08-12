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
        const url = new URL(request.url);
        const day = url.searchParams.get('day') || undefined;
        const submissionsCollection = await getCollection('submittedAssignments');

        // Validar ID
        if (!ObjectId.isValid(submissionId)) {
            return NextResponse.json(
                { error: 'ID de envío inválido' },
                { status: 400 }
            );
        }

        // Buscar la asignación raíz y nombre de estudiante
        const submission = await submissionsCollection.aggregate([
            { $match: { _id: new ObjectId(submissionId) } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            { $addFields: { studentName: '$student.username' } }
        ]).next();

        if (!submission) {
            return NextResponse.json(
                { error: 'No se encontró la asignación' },
                { status: 404 }
            );
        }
        // Si se solicita un día específico, devolver datos aplanados de ese día
        if (day) {
            const dayData = submission.days?.[day];
            if (!dayData) {
                return NextResponse.json(
                    { success: false, error: 'No existe entrega para el día solicitado' },
                    { status: 404 }
                );
            }
            const flat = {
                _id: submission._id,
                classId: submission.classId,
                studentId: submission.studentId,
                studentName: submission.studentName,
                weekNumber: submission.weekNumber,
                day,
                fileUrl: dayData.fileUrl ?? null,
                fileName: dayData.fileName ?? null,
                audioUrl: dayData.audioUrl ?? null,
                message: dayData.message ?? '',
                submittedAt: dayData.submittedAt ?? null,
                fileGrade: dayData.fileGrade ?? null,
                fileFeedback: dayData.fileFeedback ?? '',
                audioGrade: dayData.audioGrade ?? null,
                audioFeedback: dayData.audioFeedback ?? '',
                overallGrade: dayData.overallGrade ?? null,
                overallFeedback: dayData.overallFeedback ?? '',
                isGraded: Boolean(dayData.isGraded)
            };
            return NextResponse.json({ success: true, data: flat });
        }

        // Si no se pasa día, devolver el documento completo (compatibilidad)
        return NextResponse.json({ success: true, data: submission });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener detalles';
        return NextResponse.json(
            { success: false, error: message },
            { status: 500 }
        );
    }
}
