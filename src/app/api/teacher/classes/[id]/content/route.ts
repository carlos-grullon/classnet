import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';

interface SupportMaterial {
  id: string;
  description: string;
  link: string;
  fileName?: string;
}

interface IClassContent{
  welcomemessage: string;
  whatsappLink: string;
  resources: SupportMaterial[];
}

interface ClassContent {
  _id: string;
  classId: string;
  welcomemessage: string;
  whatsappLink: string;
  resources: SupportMaterial[];
  updatedAt: Date;
  durationWeeks: number;
}

export async function PATCH(
  request: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const classId = params.classId;
    const classContent: IClassContent = await request.json();
    
    const classContentCollection = await getCollection('class_contents');
    const result = await classContentCollection.updateOne(
      { classId: classId },
      {
        $set: {
          welcomemessage: classContent.welcomemessage,
          whatsappLink: classContent.whatsappLink,
          resources: classContent.resources,
          updatedAt: new Date()
        }
      }
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

    content._id = content._id.toString();
    content.classId = content.classId.toString();
    content.durationWeeks = classData.durationWeeks;
    
    return NextResponse.json({
      success: true,
      data: content
    });
    
  } catch (error: any) {
    console.error('Error al obtener contenido:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
