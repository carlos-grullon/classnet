"use client";

import { useState } from "react";
import { Card, ThemeToggle, Input, Button } from "@/components";
import { FetchData, ErrorMsj, SuccessMsj } from "@/utils/Tools.tsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import { FiLogIn } from "react-icons/fi";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, LoginFormValues } from '@/validations/login';
import { Controller } from 'react-hook-form';

export default function LoginPage() {
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(LoginFormSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const { 
    handleSubmit,
    formState: { errors },
    control
  } = form;

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const user = await FetchData("/api/login", data);
      SuccessMsj("Inicio de sesión exitoso");
      if (user.userIsStudent && user.userIsTeacher) {
        router.push("/");
      } else if (user.userIsStudent) {
        router.push("/student");
      } else if (user.userIsTeacher) {
        router.push("/teacher");
      }
    } catch (error) {
      ErrorMsj("Credenciales incorrectas");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="min-h-screen flex items-center justify-center p-4 -mt-16">
        <Card title="Iniciar Sesión" icon={<FiLogIn className="text-blue-500" />}>
          <ToastContainer/>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  label="Email"
                  error={errors.email?.message}
                />
              )}
            />
            
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Contraseña"
                  type="password"
                  error={errors.password?.message}
                />
              )}
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
