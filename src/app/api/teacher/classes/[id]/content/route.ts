import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { ClassContent } from '@/interfaces/VirtualClassroom';
import { getDayName, getLevelName, mongoTimeToTimeString12h } from '@/utils/GeneralTools.ts';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const classId = params.id;
    const classCollection = await getCollection('classes');
    const classData = await classCollection.findOne({
      _id: new ObjectId(classId)
    });
    const classContentCollection = await getCollection('class_contents');
    const content = await classContentCollection.findOne<ClassContent>({
      classId: new ObjectId(classId)
    });

    if (!content || !classData) {
      throw new Error('Contenido no encontrado');
    }
    const usersCollection = await getCollection('users');
    const teacher = await usersCollection.findOne({
      _id: new ObjectId(classData.teacher_id)
    });

    if (!teacher) {
      throw new Error('Profesor no encontrado');
    }

    content._id = content._id.toString();
    content.classId = content.classId.toString();
    content.durationWeeks = classData.durationWeeks;
    content.teacher = {
      name: teacher.username,
      country: teacher.country,
      whatsapp: teacher.number,
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

    return NextResponse.json({
      success: true,
      data: content
    });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al obtener contenido';
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
