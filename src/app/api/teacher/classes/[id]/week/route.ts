import { NextResponse, NextRequest } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { formatDateToInput, getLevelName, parseInputDate } from '@/utils/GeneralTools';
import { WeekContent, StudentAssignment } from '@/interfaces/VirtualClassroom';
import { getUserId } from '@/utils/Tools.ts';
import { sendNotification } from '@/services/notificationService'

// POST /api/teacher/classes/[id]/week - Crear o actualizar contenido semanal
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const classId = (await params).id;
    const data = await request.json();
    const weeksCollection = await getCollection('weeks');
    const classesCollection = await getCollection('classes');
    // convertir la fecha a Date para guardarla
    if (data.assignment) {
      data.assignment.dueDate = parseInputDate(data.assignment.dueDate);
      // Validar que la fecha no sea anterior a la actual
      if (data.assignment.dueDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'La fecha de entrega no puede ser anterior a la fecha actual' },
          { status: 400 }
        );
      }
    }
    const filter = {
      classId: new ObjectId(classId),
      weekNumber: Number(data.weekNumber)
    };

    const existingWeek = await weeksCollection.findOne(filter);

    if (existingWeek) {
      await weeksCollection.updateOne(
        filter,
        {
          $set: {
            weekNumber: data.weekNumber,
            meetingLink: data.meetingLink,
            recordingLink: data.recordingLink,
            supportMaterials: data.supportMaterials,
            assignment: data.assignment,
            updatedAt: new Date()
          }
        }
      );
      return NextResponse.json({ success: true });
    } else {
      await weeksCollection.insertOne({
        classId: new ObjectId(classId),
        weekNumber: Number(data.weekNumber),
        meetingLink: data.meetingLink,
        recordingLink: data.recordingLink,
        supportMaterials: data.supportMaterials,
        assignment: data.assignment,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Enviar notificación a los estudiantes de una nueva asignación
      const enrollmentsCollection = await getCollection('enrollments');
      // Busca todas las inscripciones activas en esta clase
      const enrollments = await enrollmentsCollection.find({
        class_id: new ObjectId(classId),
        status: { $in: ['enrolled', 'trial'] }
      }).toArray();
      // Obtiene los IDs de los estudiantes
      const studentIds = enrollments.map(enrollment => enrollment.student_id);
      // Obtiene los datos de la clase
      const classData = await classesCollection.findOne({ _id: new ObjectId(classId) });
      await sendNotification({
        userId: studentIds,
        title: '¡Nueva asignación!',
        message: `Tienes una nueva asignación en la clase ${classData!.subjectName} ${getLevelName(classData!.level)}`,
        link: `/student/classes/${classId}/virtual-classroom`,
        type: 'info'
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const userId = await getUserId(request);
    const classId = (await params).id;
    const { searchParams } = new URL(request.url);
    const weekNumber = Number(searchParams.get('week'));
    const weeksCollection = await getCollection<WeekContent>('weeks');

    const weekData = await weeksCollection.findOne({
      classId: new ObjectId(classId),
      weekNumber
    });
    if (!weekData) {
      return NextResponse.json({ success: true, data: null });
    }
    // convertir la fecha a string para mostrarla
    if (weekData.assignment && weekData.assignment.dueDate instanceof Date) {
      weekData.assignment.dueDate = formatDateToInput(weekData.assignment.dueDate);
    }

    let studentAssignment: StudentAssignment | null = null;

    if (weekData.assignment) {
      const submittedAssignmentsCollection = await getCollection('submittedAssignments');
      const Assignment = await submittedAssignmentsCollection.findOne({
        weekNumber,
        classId: new ObjectId(classId),
        studentId: new ObjectId(userId)
      });
      if (Assignment) {
        studentAssignment = {
          fileUrl: Assignment.fileUrl || null,
          fileName: Assignment.fileName || null,
          audioUrl: Assignment.audioUrl || null,
          message: Assignment.message || null,
          fileSubmission: {
            submittedAt: Assignment.fileUrl ? formatDateToInput(Assignment.submittedAt) || null : null,
            isGraded: Assignment.fileUrl ? Assignment.isGraded || false : false,
            grade: Assignment.fileGrade || null
          },
          audioSubmission: {
            submittedAt: Assignment.audioUrl ? formatDateToInput(Assignment.submittedAt) || null : null,
            isGraded: Assignment.audioUrl ? Assignment.isGraded || false : false,
            grade: Assignment.audioGrade || null
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: weekData || null,
      studentAssignment: studentAssignment
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al obtener contenido de semana:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
