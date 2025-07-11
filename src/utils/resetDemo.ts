import 'dotenv/config';
import { seedDatabase } from '@/utils/seedDatabase';
import { getCollection } from "@/utils/MongoDB";
import { ObjectId } from "mongodb";

interface MetaDocument {
    _id: ObjectId;
    name: string;
    date: Date;
}

export async function resetDemoIfNeeded() {
  const db = await getCollection("meta");
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normaliza a medianoche

  const meta = await db.findOne<MetaDocument>({ name: "lastReset" });
  
  // Compara solo día/mes/año
  const lastResetDate = meta?.date ? new Date(meta.date) : null;
  if (lastResetDate) lastResetDate.setHours(0, 0, 0, 0);

  if (!lastResetDate || lastResetDate.getTime() !== today.getTime()) {
    console.log("⚠️ Nuevo día detectado. Ejecutando reset automático...");
    await seedDatabase();
    await db.updateOne(
      { name: "lastReset" },
      { $set: { date: today } },
      { upsert: true }
    );
  }
}

export async function resetDemoManually() {
  console.log("🔁 Reset manual ejecutado.");
  await seedDatabase();
  const db = await getCollection("meta");
  const today = new Date();
  await db.updateOne(
    { name: "lastReset" },
    { $set: { date: today } },
    { upsert: true }
  );
}
