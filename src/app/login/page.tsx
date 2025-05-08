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

  const validateForm = () => {
    if (!formData.email) {
      return "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      return "El email no es válido";
    }
    if (!formData.password) {
      return "La contraseña es requerida";
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm() !== true) {
      ErrorMsj(validateForm() as string, 'Error');
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
        <Card title="Iniciar Sesión">
          <ToastContainer />
          <form onSubmit={handleSubmit}>
            <Input id="email" label="Email" type="text" value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              error={validateForm() as string}
            />
            <Input id="password" label="Contraseña" type="password"
              value={formData.password} required error={validateForm() as string}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
