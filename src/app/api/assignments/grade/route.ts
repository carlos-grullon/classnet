import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from '@/utils/MongoDB.ts';

type GradeData = {
  submissionId: string;
  fileGrade?: number;
  fileFeedback?: string;
  audioGrade?: number;
  audioFeedback?: string;
  overallGrade?: number;
  overallFeedback?: string;
};

// api/assignments/grade POST para calificar una entrega
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId(request);
    const submissionsCollection = await getCollection('submittedAssignments');
    const data: GradeData = await request.json();

    // Validar submissionId
    if (!ObjectId.isValid(data.submissionId)) {
      return NextResponse.json(
        { error: 'ID de envío inválido' },
        { status: 400 }
      );
    }

    // Validar rangos de calificación (0-100)
    const validateGrade = (grade?: number) => 
      grade !== undefined && (grade < 0 || grade > 100);
      
    if (validateGrade(data.fileGrade) || validateGrade(data.audioGrade) || validateGrade(data.overallGrade)) {
      return NextResponse.json(
        { error: 'Las calificaciones deben estar entre 0 y 100' },
        { status: 400 }
      );
    }

    // Actualizar calificaciones
    const result = await submissionsCollection.updateOne(
      { _id: new ObjectId(data.submissionId) },
      { 
        $set: { 
          fileGrade: data.fileGrade,
          fileFeedback: data.fileFeedback,
          audioGrade: data.audioGrade,
          audioFeedback: data.audioFeedback,
          overallGrade: data.overallGrade,
          overallFeedback: data.overallFeedback,
          isGraded: true,
          gradedAt: new Date(),
          gradedBy: new ObjectId(userId)
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'No se encontró la asignación para calificar' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al calificar';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
