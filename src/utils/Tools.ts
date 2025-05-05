import { randomUUID } from 'crypto';

export function GenerarUuid(cantiddad: number = 1): string {
    var uuid = "";
    for (let i = 0; i < cantiddad; i++) {
        uuid += randomUUID();
    }
    return uuid;
}