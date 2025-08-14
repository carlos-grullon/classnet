import { NextResponse, NextRequest } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { formatDateToInput, getLevelName, parseInputDate } from '@/utils/GeneralTools';
import { WeekContent } from '@/interfaces/VirtualClassroom';
import { getUserId } from '@/utils/Tools.ts';
import { sendNotification } from '@/services/notificationService'

interface DaySubmission {
  fileUrl?: string | null;
  fileName?: string | null;
  audioUrl?: string | null;
  message?: string | null;
  fileSubmittedAt?: Date | null | string;
  audioSubmittedAt?: Date | null | string;
  fileGrade?: number | null;
  audioGrade?: number | null;
  isGraded?: boolean;
}

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
    
    const filter = {
      classId: new ObjectId(classId),
      weekNumber: Number(data.weekNumber)
    };

    const existingWeek = await weeksCollection.findOne(filter);

    const baseDoc: WeekContent = {
      weekNumber: Number(data.weekNumber),
      content: Array.isArray(data.content) ? data.content : [],
    };

    if (existingWeek) {
      await weeksCollection.updateOne(filter, { $set: baseDoc });
      return NextResponse.json({ success: true });
    } else {
      await weeksCollection.insertOne({
        classId: new ObjectId(classId),
        ...baseDoc,
        createdAt: new Date(),
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
        title: '📝 ¡Nueva asignación!',
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
    const weekData: WeekContent | null = await weeksCollection.findOne({
      classId: new ObjectId(classId),
      weekNumber
    });
    if (!weekData) {
      return NextResponse.json({ success: true, data: null });
    }
    // convertir fechas: solo nuevo formato por-día
    if (Array.isArray(weekData.content)) {
      weekData.content = weekData.content.map((d) => {
        if (d?.assignment?.dueDate instanceof Date) {
          d.assignment.dueDate = formatDateToInput(d.assignment.dueDate);
        }
        return d;
      });
    }

    // Obtener la(s) entrega(s) del estudiante en formato por-día (nueva estructura)
    const submittedAssignmentsCollection = await getCollection('submittedAssignments');
    const Assignment = await submittedAssignmentsCollection.findOne({
      weekNumber,
      classId: new ObjectId(classId),
      studentId: new ObjectId(userId)
    });

    let studentAssignmentDays: Record<string, DaySubmission> | null = null;
    if (Assignment?.days && typeof Assignment.days === 'object') {
      studentAssignmentDays = {};
      for (const [day, sub] of Object.entries<DaySubmission>(Assignment.days)) {
        studentAssignmentDays[day] = {
          fileUrl: sub?.fileUrl ?? null,
          fileName: sub?.fileName ?? null,
          audioUrl: sub?.audioUrl ?? null,
          message: sub?.message ?? '',
          fileSubmittedAt: sub?.fileSubmittedAt instanceof Date ? formatDateToInput(sub.fileSubmittedAt) : sub?.fileSubmittedAt ?? null,
          audioSubmittedAt: sub?.audioSubmittedAt instanceof Date ? formatDateToInput(sub.audioSubmittedAt) : sub?.audioSubmittedAt ?? null,
          fileGrade: sub?.fileGrade ?? null,
          audioGrade: sub?.audioGrade ?? null,
          isGraded: sub?.isGraded ?? false
        };
      }
    }

    return NextResponse.json({
      success: true,
      data: weekData || null,
      studentAssignment: null,
      studentAssignmentDays
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
