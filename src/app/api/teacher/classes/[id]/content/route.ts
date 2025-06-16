import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

interface IWeek {
  [key: string]: any;
}

interface IClassContent {
  classId: string;
  presentationContent: string;
  whatsappLink: string;
  materialLink: string;
  weeks: IWeek[];
  createdAt?: Date;
  updatedAt?: Date;
}

export async function POST(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;
    const { presentationContent, whatsappLink, materialLink }: Partial<IClassContent> = await request.json();
    
    const updateData = {
      presentationContent: presentationContent || '',
      whatsappLink: whatsappLink || '',
      materialLink: materialLink || '',
      updatedAt: new Date()
    };
    
    const classContentCollection = await getCollection('class_contents');
    const result = await classContentCollection.updateOne(
      { classId: classId },
      {
        $set: updateData,
        $setOnInsert: {
          classId: classId,
          createdAt: new Date(),
          weeks: []
        }
      },
      { upsert: true }
    );
    
    return NextResponse.json({
      success: true,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId
    });
    
  } catch (error: any) {
    console.error('Error al guardar contenido:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request, 
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;
    const classContentCollection = await getCollection('class_contents');
    const content = await classContentCollection.findOne<IClassContent>({
      classId: classId
    });
    
    return NextResponse.json({
      success: true,
      data: content || {
        classId: classId,
        presentationContent: '',
        whatsappLink: '',
        materialLink: '',
        weeks: [],
        createdAt: new Date()
      }
    });
    
  } catch (error: any) {
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
