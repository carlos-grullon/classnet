import { toast } from "react-toastify";
import { Dispatch, SetStateAction } from 'react';
import { FiLink, FiFileText, FiImage, FiFile } from 'react-icons/fi';

export async function FetchData(url: string, data: Record<string, any> = {}, method: string = "POST", extraHeaders: Record<string, any> = {}) {
    const requestBody = { body: JSON.stringify(data) };
    const response = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            ...extraHeaders
        },
        ...(method !== "GET" ? requestBody : {}),
        credentials: "include"
    });

    const responseJson = await response.json();

    if (!response.ok) {
        throw new Error(responseJson.error || "Error al obtener datos");
    }
    return responseJson;
}

export function SuccessMsj(message: string) {
    toast.success(message, {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            });
}

export function ErrorMsj(message: string) {
    toast.error(message, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true
            });
}

// Función para formatear fechas
export function formatDate(date: Date): string {
    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export const handleInputChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  formData: T,
  setFormData: Dispatch<SetStateAction<T>>
) => {
  const { name, value, type } = e.target;
  const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
  setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
};

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

// Función para obtener el icono según el tipo de archivo
export const getFileIcon = (fileName?: string) => {
  if (!fileName) return <FiLink className="text-blue-600 dark:text-blue-300 text-xl" />;
  
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  if (!extension) return <FiLink className="mr-2 text-4xl" />;

  switch (extension) {
    case 'pdf':
      return <FiFileText className="mr-2 text-red-500 text-4xl" />;
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return <FiImage className="mr-2 text-blue-500 text-4xl" />;
    case 'doc':
    case 'docx':
      return <FiFileText className="mr-2 text-blue-600 text-4xl" />;
    default:
      return <FiFile className="mr-2 text-4xl" />;
  }
};