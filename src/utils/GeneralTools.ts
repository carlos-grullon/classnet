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