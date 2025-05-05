import { getCollection } from "./MongoDB";
import { GenerarUuid } from './Tools';

export async function getSession(idSession: string): Promise<Record<string, any>> {
    try {
        const collection = await getCollection("sessions");
        const sessionData = await collection.findOne({
            idSession: idSession,
        });
        return sessionData as Record<string, any>;
    } catch (err) {
        throw err;
    }
}

export async function createSession(idSession: string = '', data: Record<string, any> = {}): Promise<string> {
    try {
        if (idSession === '') {
            idSession = GenerarUuid();
        }
    
        const collection = await getCollection("sessions");
        await collection.insertOne({
            idSession: idSession,
            data: data,
        });
        return idSession;
    } catch (err) {
        throw err;
    }
}

export async function setSession(idSession: string, data: Record<string, any>): Promise<void> {
    try {
        const session = await getSession(idSession);
        if (!session) {
            await createSession(idSession, data);
            return;
        }

        const collection = await getCollection("sessions");
        await collection.updateOne(
            { idSession: idSession },
            { $set: data }
        );
    } catch (err) {
        throw err;
    }
}

export async function deleteSession(idSession: string): Promise<void> {
    try {
        const collection = await getCollection("sessions");
        await collection.deleteOne({
            idSession: idSession,
        });
    } catch (err) {
        throw err;
    }
}