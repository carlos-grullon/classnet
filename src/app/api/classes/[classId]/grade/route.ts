import { NextResponse, NextRequest } from 'next/server';
import { ObjectId } from 'mongodb';
import { getUserId } from '@/utils/Tools.ts';
import { getCollection } from '@/utils/MongoDB.ts';

// api/classes/classId/grade Get para obtener todas las calificaciones de una clase.
export async function GET(request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
): Promise<NextResponse> {
  try {
    const classId = (await params).classId;
    const userId = await getUserId(request);
    const submittedAssignmentsCollection = await getCollection('submittedAssignments');
    const submittedAssignments = await submittedAssignmentsCollection.find({ 
        classId: new ObjectId(classId), 
        studentId: new ObjectId(userId) 
    }).toArray();
    return NextResponse.json({ success: true, data: submittedAssignments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al calificar';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
