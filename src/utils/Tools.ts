import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

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

export async function getUserId(request: NextRequest): Promise<string> {
    try {
        const token = request.cookies.get('AuthToken')?.value;
        if (!token) throw new Error('No token found');
        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        const { payload } = await jwtVerify(token, secret);
        
        if (!payload.userId || typeof payload.userId !== 'string') {
            throw new Error('Invalid token payload');
        }
        
        return payload.userId;
    } catch (error) {
        console.error('Error getting user ID from token:', error);
        throw error;
    }
}

/**
 * Convierte un string de hora (24h) a un objeto Date de MongoDB usando época Unix como referencia
 * @param timeString String en formato HH:MM (ej. "14:30")
 * @returns Objeto Date con fecha 1970-01-01 y la hora especificada, en UTC
 */
export function timeStringToMongoTime(timeString: string): Date {
    // Validación estricta del formato
    if (!/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        throw new Error('Formato de hora inválido. Use HH:MM en 24h (ej. "14:30")');
    }

    const [hours, minutes] = timeString.split(':').map(Number);
    
    // Fecha fija de referencia (época Unix)
    const timeOnlyDate = new Date(0); // 1970-01-01T00:00:00.000Z
    timeOnlyDate.setUTCHours(hours, minutes, 0, 0);

    return timeOnlyDate;
}

/**
 * Convierte un objeto Date de MongoDB (con fecha Unix) a string de hora 24h
 * @param date Objeto Date almacenado en MongoDB (debe usar 1970-01-01 como fecha base)
 * @returns String en formato HH:MM (24h) en UTC
 */
export function mongoTimeToTimeString(date: Date): string {
    if (!(date instanceof Date)) {
        throw new Error('Se esperaba un objeto Date válido');
    }
    
    // Extrae horas y minutos en UTC
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
}