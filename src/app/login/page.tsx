"use client";

import { useState } from "react";
import { Card, ThemeToggle, Input, Button } from "@/components";
import { FetchData, ErrorMsj, SuccessMsj } from "@/utils/Tools.tsx";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLogIn } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginFormSchema, LoginFormValues } from '@/validations/login';
import { Controller } from 'react-hook-form';
import { useUser } from '@/providers/UserProvider';

interface User {
  userId: string;
  userIsStudent: boolean;
  userIsTeacher: boolean;
  userEmail: string;
  userImage: string;
  userName: string;
  userNumber: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useUser();

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
      const user = await FetchData("/api/login", data) as User;
      setUser(user);
      SuccessMsj("Inicio de sesión exitoso");
      if (user.userIsTeacher) {
        router.push("/teacher");
      } else if (user.userIsStudent) {
        router.push("/student");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al iniciar sesión";
      ErrorMsj(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="min-h-screen flex items-center flex-col justify-center p-4 -mt-20">
        <div className="text-center mb-6">
          <h1 className="text-7xl lg:text-8xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent p-4 italic max-w-full break-words">
            ClassNet
          </h1>
        </div>
        <Card title="Iniciar Sesión" icon={<FiLogIn className="text-blue-500" />}>
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
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-500 dark:text-white">O continúa con</span>
              </div>
            </div>

            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => window.location.href = '/api/auth/google'}
                className="flex items-center justify-center gap-2"
              >
                <FcGoogle size={20} className="mr-2" />  Iniciar sesión con Google
              </Button>
            </div>
          </div>

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
