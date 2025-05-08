"use client";

import { FormEvent, useState } from "react";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { CrearCookie, FetchData, ErrorMsj } from "@/utils/Tools.tsx";
import { setGlobalSession } from "@/utils/GlobalSession";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import ThemeToggle from "@/components/ThemeToggle";
import { FiLogIn } from "react-icons/fi";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const validateForm = () => {
    const newErrors: { email?: string, password?: string } = {};

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
    setFormSubmitted(true);

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
      ErrorMsj(error.message, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4 hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card title="Iniciar Sesión" icon={<FiLogIn className="text-blue-500" />}>
          <ToastContainer />
          <form onSubmit={handleSubmit}>
            <Input
              id="email"
              label="Email"
              type="text"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (formSubmitted) validateForm();
              }}
              error={formSubmitted ? errors.email : undefined}
            />
            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              required
              error={formSubmitted ? errors.password : undefined}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (formSubmitted) validateForm();
              }}
            />
            <div className="flex items-center">
              <Button type="submit" variant="primary" fullWidth isLoading={isLoading}
                disabled={isLoading}>
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿No tienes cuenta?
            <Link href="/register" className="text-blue-500 hover:text-blue-700 ml-1">
              Regístrate aquí
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
}
