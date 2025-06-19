import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';
import { ObjectId } from 'mongodb';

interface WeekContent {
  meetingLink: string;
  recordingLink: string;
  supportMaterials: {
    id: string;
    description: string;
    link: string;
    fileName?: string;
  }[];
  assignment: {
    dueDate: string;
    description: string;
    hasAudio: boolean;
    fileLink?: string;
    fileName?: string;
  } | null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { weekNumber, content } = await request.json();
    const weeksCollection = await getCollection('weeks');
    
    await weeksCollection.updateOne(
      { 
        classId: new ObjectId(params.id), 
        weekNumber: Number(weekNumber) 
      },
      { 
        $set: { 
          content,
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
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
    const { searchParams } = new URL(request.url);
    const weekNumber = Number(searchParams.get('week'));
    const weeksCollection = await getCollection('weeks');
    
    const weekData = await weeksCollection.findOne({
      classId: new ObjectId(params.id),
      weekNumber
    });

    return NextResponse.json({
      success: true,
      data: weekData?.content || null
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
