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
