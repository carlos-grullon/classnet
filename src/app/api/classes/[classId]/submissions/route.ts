import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from "@/utils/MongoDB";

// api/classes/[classId]/submissions GET para obtener todas las entregas de una clase
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getUserId(request);
    const classId = (await params).classId;
    const classCollection = await getCollection('classes');

    // Verificar que el profesor tenga acceso a esta clase
    const classData = await classCollection.findOne({
      _id: new ObjectId(classId),
      teacher_id: new ObjectId(userId)
    });

    if (!classData) {
      return NextResponse.json(
        { error: 'No tienes permiso para ver esta clase' },
        { status: 403 }
      );
    }

    // Obtener todas las entregas de esta clase y aplanar por día desde submittedAssignments.days
    const submissionsCollection = await getCollection('submittedAssignments');
    const submissions = await submissionsCollection.aggregate([
      { $match: { classId: new ObjectId(classId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      // Convertir el mapa days en arreglo de pares { k, v }
      {
        $project: {
          _id: 1,
          classId: 1,
          studentId: 1,
          weekNumber: 1,
          studentName: '$student.username',
          daysArray: { $objectToArray: { $ifNull: ['$days', {}] } }
        }
      },
      { $unwind: '$daysArray' },
      {
        $project: {
          _id: 1,
          classId: 1,
          studentId: 1,
          weekNumber: 1,
          studentName: 1,
          day: '$daysArray.k',
          fileUrl: '$daysArray.v.fileUrl',
          fileName: '$daysArray.v.fileName',
          audioUrl: '$daysArray.v.audioUrl',
          message: '$daysArray.v.message',
          submittedAt: '$daysArray.v.submittedAt',
          // Campos de calificación por día (si existen)
          fileGrade: '$daysArray.v.fileGrade',
          fileFeedback: '$daysArray.v.fileFeedback',
          audioGrade: '$daysArray.v.audioGrade',
          audioFeedback: '$daysArray.v.audioFeedback',
          overallGrade: '$daysArray.v.overallGrade',
          overallFeedback: '$daysArray.v.overallFeedback',
          isGraded: { $toBool: { $ifNull: ['$daysArray.v.isGraded', false] } },
          createdAt: '$daysArray.v.submittedAt'
        }
      },
      { $sort: { weekNumber: 1, day: 1 } }
    ]).toArray();

    return NextResponse.json({ submissions });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener las entregas';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
