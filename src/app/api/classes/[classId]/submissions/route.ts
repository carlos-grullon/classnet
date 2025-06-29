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

    // Obtener todas las entregas de esta clase con datos básicos del estudiante
    const submissionsCollection = await getCollection('submittedAssignments');
    const submissions = await submissionsCollection.aggregate([
        { 
          $match: { 
            classId: new ObjectId(classId) 
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
        { $unwind: '$student' },
        {
          $project: {
            _id: 1,
            studentId: 1,
            studentName: '$student.username',
            weekNumber: 1,
            message: 1,
            fileUrl: 1,
            fileName: 1,
            fileGrade: 1,
            fileFeedback: 1,
            audioUrl: 1,
            audioGrade: 1,
            audioFeedback: 1,
            overallGrade: 1,
            overallFeedback: 1,
            isGraded: 1,
            createdAt: 1
          }
        },
        { $sort: { weekNumber: 1, createdAt: -1 } }
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
