import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';

export function GenerarUuid(cantiddad: number = 1): string {
    var uuid = "";
    for (let i = 0; i < cantiddad; i++) {
        uuid += randomUUID();
    }
    return uuid;
}

export async function HashPassword(password: string): Promise<string> {
    // 10 es el numero de veces que se va a ejecutar el algoritmo de hashing
    return await bcrypt.hash(password, 10);
}

export async function ComparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}