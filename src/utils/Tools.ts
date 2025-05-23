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