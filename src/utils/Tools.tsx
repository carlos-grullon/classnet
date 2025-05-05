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

export async function FetchData(url: string, data: Record<string, any> = {}, method: string = "POST", extraHeaders: Record<string, any> = {}) {
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            ...extraHeaders
        },
        body: JSON.stringify(data),
        credentials: "include"
    });

    const responseJson = await response.json();

    if (!response.ok) {
        throw new Error(responseJson.error || "Error al iniciar sesión");
    }
    return responseJson;
}

export async function getSession(sessionName: string = ''): Promise<Record<string, any>> {
    const data = await FetchData("/api/session", {}, "GET");
    if (sessionName === '') {
        return data.sessionValue;
    }
    return data.sessionValue[sessionName];
}

export async function createSession(dataToCreate: Record<string, any>): Promise<string> {
    const data = await FetchData("/api/session", dataToCreate);
    return data.idSession;
}

export async function setSession(dataToSet: Record<string, any>): Promise<void> {
    await FetchData("/api/session", dataToSet, "UPDATE");
}

export async function deleteSession(): Promise<void> {
    await FetchData("/api/session", {}, "DELETE");
}