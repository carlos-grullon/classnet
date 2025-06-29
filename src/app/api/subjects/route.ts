import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

export async function GET() {
  try {
    const collection = await getCollection('subjects');
    const subjects = await collection.find().toArray();
    return NextResponse.json({ subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Error fetching subjects' },
      { status: 500 }
    );
  }
}