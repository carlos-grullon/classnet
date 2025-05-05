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

export function CrearCookie(name: string, value: string, days: number = -1) {
    const date = new Date();
    if (days >= 0) {
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        var expires = "expires=" + date.toUTCString();
    } else {
        var expires = "";
    }
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

export function LeerCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

export function EliminarCookie(name: string) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}