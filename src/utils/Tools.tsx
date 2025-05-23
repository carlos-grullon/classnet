import { toast } from "react-toastify";
import { Dispatch, SetStateAction } from 'react';

export async function FetchData(url: string, data: Record<string, any> = {}, method: string = "POST", extraHeaders: Record<string, any> = {}) {
    const requestBody = { body: JSON.stringify(data) };
    const response = await fetch((process.env.HOST_AND_PORT || 'http://localhost:3000') + url, {
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
        throw new Error(responseJson.error || "Error al iniciar sesión");
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

export const handleInputChange = <T extends Record<string, any>>(
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  formData: T,
  setFormData: Dispatch<SetStateAction<T>>
) => {
  const { name, value, type } = e.target;
  const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
  setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
};