// para correr el archivo necesitas poner en la terminal: node --loader ts-node/esm cambios.mts
import { MongoClient } from 'mongodb';
import 'dotenv/config';

async function main() {
    let client;
    try {
        const MONGO_URI = process.env.MONGO_URI!;
        client = new MongoClient(MONGO_URI);
        await client.connect();
        console.log('✅ Conectado a MongoDB');
        const db = client.db('classnet');

        // await updateOrCreateField(db, 'users', 'lastNotificationView', new Date('2023-01-05'));
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        if (client) {
            await client.close();
        }
    }
}

async function updateOrCreateField(
    db: any,
    collection: string,
    field: string,
    value: any
) {
    const update = { $set: { [field]: value } };
    const result = await db.collection(collection).updateMany({}, update);
    console.log(`✅ Actualizado ${result.modifiedCount} documentos`);
}


main();