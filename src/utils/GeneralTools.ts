/**
 * Formatea una fecha al formato "día/mes(texto)/año"
 * @param date Objeto Date a formatear
 * @returns String en formato "d/Mes/yyyy" (ej. "3/Junio/2025")
 */
export function formatDateLong(date: Date): string {
    const day = date.getDate();
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
}

/**
 * Formatea un número a formato de moneda con separador de miles
 * @param amount Número a formatear
 * @param currency Código de moneda (opcional, por defecto '$')
 * @returns String con el número formateado (ej. "$10,000" o "DOP 10,000")
 */
export function formatCurrency(amount: number, currency: string = '$'): string {
  const formattedAmount = amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return currency === '$' ? `$${formattedAmount}` : `${currency} ${formattedAmount}`;
}

export const getDayName = (days: string[]): string => {
  const daysMap = {
    '1': 'Lunes',
    '2': 'Martes',
    '3': 'Miércoles',
    '4': 'Jueves',
    '5': 'Viernes',
    '6': 'Sábados',
    '7': 'Domingos'
  };
  
  return days.map(day => daysMap[day as keyof typeof daysMap]).join(', ');
};

export const getLevelName = (level: string) => {
  switch(level) {
    case '1': return 'Principiante';
    case '2': return 'Intermedio';
    case '3': return 'Avanzado';
    default: return level;
  }
};

/**
 * Convierte un objeto Date de MongoDB a string de hora en formato 12h (AM/PM)
 * @param date Objeto Date almacenado en MongoDB (debe usar 1970-01-01 como fecha base)
 * @returns String en formato HH:MM AM/PM en UTC
 */
export function mongoTimeToTimeString12h(date: Date): string {
    if (!(date instanceof Date)) {
        throw new Error('Se esperaba un objeto Date válido');
    }
    
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours || 12; // Convertir 0 a 12
    
    return `${hours}:${minutes} ${ampm}`;
}

/**
 * Convierte una fecha en formato yyyy-mm-dd o Date a dd/mes(texto)/yyyy
 * @param dateString Fecha en formato yyyy-mm-dd (ej. "2025-06-19") o Date (ej. new Date())
 * @returns String en formato "dd/Mes/yyyy" (ej. "19/Junio/2025")
 */
export function formatInputDateToLong(dateString: string | Date): string {
    const date = dateString instanceof Date ? formatDateToInput(dateString) : dateString;
    const [year, month, day] = date.split('-').map(Number);
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error('Formato de fecha inválido. Se esperaba yyyy-mm-dd');
    }
    
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return `${day}/${monthNames[month - 1]}/${year}`;
}

/**
 * Convierte una fecha en formato yyyy-mm-dd a un objeto Date
 * @param dateString Fecha en formato yyyy-mm-dd (ej. "2025-06-19")
 * @returns Objeto Date correspondiente
 */
export function parseInputDate(dateString: string): Date {
    const [year, month, day] = dateString.split('-').map(Number);
    
    if (isNaN(year) || isNaN(month) || isNaN(day) || 
        month < 1 || month > 12 || day < 1 || day > 31) {
        throw new Error('Formato de fecha inválido. Se esperaba yyyy-mm-dd');
    }
    
    // Nota: Los meses en Date son 0-indexed (0 = Enero, 11 = Diciembre)
    return new Date(year, month - 1, day);
}

/**
 * Convierte un objeto Date a formato yyyy-mm-dd
 * @param date Objeto Date a convertir
 * @returns String en formato yyyy-mm-dd (ej. "2025-06-19")
 */
export function formatDateToInput(date: Date): string {
    if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Se esperaba un objeto Date válido');
    }
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 porque los meses son 0-indexed
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}