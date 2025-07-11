import { NextResponse } from 'next/server';
import { seedDatabase } from '@/utils/seedDatabase';
import { getCollection } from "@/utils/MongoDB";
import { ObjectId } from "mongodb";

interface MetaDocument {
    _id: ObjectId;
    name: string;
    date: Date;
}

// GET /api/reset-demo - Reset automático
export async function GET() {
    try {
        const db = await getCollection("meta");
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliza a medianoche

        const meta = await db.findOne<MetaDocument>({ name: "lastReset" });

        // Compara solo día/mes/año
        const lastResetDate = meta?.date ? new Date(meta.date) : null;
        if (lastResetDate) lastResetDate.setHours(0, 0, 0, 0);
        let resetDone = false;

        if (!lastResetDate || lastResetDate.getTime() !== today.getTime()) {
            console.log("⚠️ Nuevo día detectado. Ejecutando reset automático...");
            await seedDatabase();
            await db.updateOne(
                { name: "lastReset" },
                { $set: { date: today } },
                { upsert: true }
            );
            resetDone = true;
        }
        return NextResponse.json({ success: true, message: "Demo reset done", resetDone }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al resetear la demo';
        console.error(message, error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}

// POST /api/reset-demo - Reset manual
export async function POST() {
    try {
        console.log("🔁 Reset manual ejecutado.");
        await seedDatabase();
        const db = await getCollection("meta");
        const today = new Date();
        await db.updateOne(
            { name: "lastReset" },
            { $set: { date: today } },
            { upsert: true }
        );
        return NextResponse.json({ success: true, message: "Demo reset done" }, { status: 200 });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al resetear la demo';
        console.error(message, error);
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}