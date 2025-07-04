import { NextResponse } from 'next/server';

export async function GET() {
  const mockTasks = [
    {
      id: '1',
      title: 'Tarea de Matemáticas',
      dueDate: '2025-07-05T10:00:00Z', // Fecha fija
      classId: 'math101',
      className: 'Matemáticas Básicas',
      status: 'pending'
    },
    {
      id: '2',
      title: 'Ensayo de Literatura',
      dueDate: '2025-07-06T14:00:00Z', // Fecha fija
      classId: 'lit202',
      className: 'Literatura Moderna',
      status: 'pending'
    }
  ];

  return NextResponse.json(mockTasks);
}