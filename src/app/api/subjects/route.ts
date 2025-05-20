import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/MongoDB';

// Definir el tipo para el objeto formateado
type FormattedSubjects = Record<string, Record<string, string>>;

export async function GET() {
  try {
    const collection = await getCollection('subjects');
    const subjects = await collection.find().toArray();
    
    // Especificar el tipo del acumulador
    const formattedData = subjects.reduce<FormattedSubjects>((acc, { category, code, name }) => {
      if (!acc[category]) acc[category] = {};
      acc[category][code] = name;
      return acc;
    }, {});

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    return NextResponse.json(
      { error: 'Error fetching subjects' },
      { status: 500 }
    );
  }
}