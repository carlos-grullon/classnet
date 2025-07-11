import { NextRequest, NextResponse } from 'next/server';
import { seedDatabase } from '@/utils/seedDatabase';

// GET /api/cron/payment-reminders - Enviar recordatorios de pago
export async function GET(req: NextRequest) {
  try {
    await seedDatabase();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error en el cron de seed-db';
    console.error(message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
