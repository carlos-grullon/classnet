import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';
import { formatDateToInput, parseInputDate } from '@/utils/GeneralTools';
import { WeekContent } from '@/interfaces/VirtualClassroom';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const classId = (await params).id;
    const { weekNumber, content } = await request.json();
    const weeksCollection = await getCollection('weeks');
    // convertir la fecha a Date para guardarla
    if (content.assignment) {
      content.assignment.dueDate = parseInputDate(content.assignment.dueDate);
      // Validar que la fecha no sea anterior a la actual
      if (content.assignment.dueDate < new Date()) {
        return NextResponse.json(
          { success: false, error: 'La fecha de entrega no puede ser anterior a la fecha actual' },
          { status: 400 }
        );
      }
    }
    const filter = { 
      classId: new ObjectId(classId), 
      weekNumber: Number(weekNumber) 
    };
    
    const existingWeek = await weeksCollection.findOne(filter);
    
    if (existingWeek) {
      await weeksCollection.updateOne(
        filter,
        { 
          $set: { 
            content,
            updatedAt: new Date() 
          } 
        }
      );
    } else {
      await weeksCollection.insertOne({
        ...filter,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
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
    if (weekData.content.assignment && weekData.content.assignment.dueDate instanceof Date) {
      weekData.content.assignment.dueDate = formatDateToInput(weekData.content.assignment.dueDate);
    }

    return NextResponse.json({
      success: true,
      data: weekData.content || null
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
