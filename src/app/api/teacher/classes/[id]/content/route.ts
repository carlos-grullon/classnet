import { NextResponse, NextRequest } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { ClassContent } from '@/interfaces/VirtualClassroom';
import { getUserId } from '@/utils/Tools.ts';
import { getDayName, getLevelName, mongoTimeToTimeString12h } from '@/utils/GeneralTools.ts';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const classId = (await params).id;
    const classContent: ClassContent = await request.json();

    const classContentCollection = await getCollection('class_contents');
    const result = await classContentCollection.updateOne(
      { classId: new ObjectId(classId) },
      {
        $set: {
          welcomeMessage: classContent.welcomeMessage,
          whatsappLink: classContent.whatsappLink,
          resources: classContent.resources,
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'No se encontraron documentos para actualizar' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error al guardar contenido:', error);
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
    const userType = request.nextUrl.searchParams.get('userType');

    // Existe la clase?
    const classCollection = await getCollection('classes');
    const classExists = await classCollection.countDocuments({
      _id: new ObjectId(classId)
    });
    if (!classExists) {
      return NextResponse.json(
        { error: 'La clase no existe' },
        { status: 404 }
      );
    }

    // Validar que sea un estudiante inscrito o el profesor de la clase
    if (userType === 'student') {
      const enrollmentsCollection = await getCollection('enrollments');
      const enrollment = await enrollmentsCollection.findOne({
        student_id: new ObjectId(userId),
        class_id: new ObjectId(classId)
      });
      if (!enrollment) {
        return NextResponse.json(
          { error: 'No tienes acceso a esta clase' },
          { status: 403 }
        );
      }
    } else if (userType === 'teacher') {
      const teacherInClass = await classCollection.findOne({
        _id: new ObjectId(classId),
        teacher_id: new ObjectId(userId)
      });
      if (!teacherInClass) {
        return NextResponse.json(
          { error: 'No tienes acceso a esta clase' },
          { status: 403 }
        );
      }
    }
    const classData = await classCollection.findOne({
      _id: new ObjectId(classId)
    });
    const classContentCollection = await getCollection('class_contents');
    const content = await classContentCollection.findOne<ClassContent>({
      classId: new ObjectId(classId)
    });

    if (!content || !classData) {
      return NextResponse.json(
        { error: 'Contenido no encontrado' },
        { status: 404 }
      );
    }
    const usersCollection = await getCollection('users');
    const teacher = await usersCollection.findOne({
      _id: new ObjectId(classData.teacher_id)
    });

    if (!teacher) {
      return NextResponse.json(
        { error: 'Profesor no encontrado' },
        { status: 404 }
      );
    }

    content._id = content._id.toString();
    content.classId = content.classId.toString();
    content.durationWeeks = classData.durationWeeks;
    content.teacher = {
      name: teacher.username,
      country: teacher.country,
      number: teacher.number,
      email: teacher.email,
      photo: teacher.image_path
    };
    content.class = {
      name: classData.subjectName,
      level: getLevelName(classData.level),
      selectedDays: getDayName(classData.selectedDays),
      startTime: mongoTimeToTimeString12h(classData.startTime),
      endTime: mongoTimeToTimeString12h(classData.endTime),
      price: classData.price,
    };

    const response = NextResponse.json({
      success: true,
      content: content || null
    });

    // Configurar cache (60 segundos)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=30'
    );

    return response;

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
