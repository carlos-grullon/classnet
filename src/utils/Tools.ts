import { randomUUID } from 'crypto';
import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';

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

export function CrearCookie(name: string, value: string, days: number = 7) {
    const response = NextResponse.next();
    const date = new Date();
    // Set expiration to 7 days from now
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    
    response.cookies.set({
        name,
        value,
        expires: date,
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    });
    
    return response;
}

export function LeerCookie(request: Request, name: string): string | null {
    const cookies = request.headers.get('cookie');
    if (!cookies) return null;
    
    const nameEQ = name + '=';
    const ca = cookies.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
        }
    }
    return null;
}

export function EliminarCookie(name: string) {
    const response = NextResponse.next();
    response.cookies.set({
        name,
        value: '',
        expires: new Date(0),
        path: '/'
    });
    return response;
}
