import { NextResponse } from 'next/server';

export async function GET() {
  const mockAnnouncements = [
    {
      id: '1',
      title: 'Cambio de horario',
      content: 'La clase de matemáticas del viernes se moverá a las 10 AM',
      date: '2025-07-04T09:00:00Z', // Fecha fija
      author: 'Prof. Rodríguez'
    },
    {
      id: '2',
      title: 'Material nuevo',
      content: 'Se ha subido nuevo material para la clase de literatura',
      date: '2025-07-03T15:30:00Z', // Fecha fija
      author: 'Prof. García'
    }
  ];

  return NextResponse.json(mockAnnouncements);
}