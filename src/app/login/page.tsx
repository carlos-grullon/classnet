"use client";

import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormInput } from "@/components/forms/FormInput";
import { CrearCookie, FetchData } from "@/utils/Tools.tsx";
import { setGlobalSession } from "@/utils/GlobalSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ErrorMsj } from "@/utils/Tools.tsx";
import { ToastContainer } from "react-toastify";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [successMessage, setSuccessMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setSuccessMessage(undefined);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await FetchData("/api/login", {
        email: formData.email,
        password: formData.password,
      });

      // Guardar la sesión en una cookie para el backend
      CrearCookie('sessionId', data.idSession);

      // Crear y guardar la sesión global
      setGlobalSession({
        idSession: data.idSession,
        userIsStudent: data.userIsStudent,
        userIsTeacher: data.userIsTeacher,
        userEmail: formData.email
      });

      setSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");

      // Esperar un momento para asegurar que la sesión se guarde antes de redirigir
      setTimeout(() => {
        // Redireccionar según el tipo de usuario
        if (data.twoAccountsFound === true) {
          router.push("/");
        } else {
          data.userIsStudent ? router.push("/student/dashboard") : router.push("/teacher/dashboard");
        }
      }, 100);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setErrors({ general: error.message || "Error al iniciar sesión" });
      ErrorMsj(error.message, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Iniciar Sesión"
      error={errors.general}
      success={successMessage}
    >
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="text"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          error={errors.email}
          required
        />

        <FormInput
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 w-full hover:bg-blue-700 text-white 
              font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline 
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      </form>
      <div className="mt-4 text-center">
        <Link href="/register" className="text-blue-500 hover:text-blue-700 text-sm">
          ¿No tienes cuenta? Regístrate aquí
        </Link>
      </div>
    </AuthCard>
  );
}
