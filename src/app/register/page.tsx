'use client';

import React from 'react';
import { Card, Input, Button } from '@/components';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterFormSchema, RegisterFormValues } from '@/validations/register';
import { FetchData, ErrorMsj, SuccessMsj } from '@/utils/Tools.tsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import { FiUserPlus, FiUser, FiBook } from 'react-icons/fi';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useState } from 'react';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      user_type: 'E'
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      await FetchData('/api/register', data);
      router.push('/login');
      SuccessMsj('Registro exitoso');
    } catch (error) {
      const err = error as Error;
      ErrorMsj(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card title="Registro" icon={<FiUserPlus />}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Input
                label="Nombre completo"
                error={errors.username?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <Input
                type="email"
                label="Email"
                error={errors.email?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Input
                type="password"
                label="Contraseña"
                error={errors.password?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Input
                type="password"
                label="Confirmar contraseña"
                error={errors.confirmPassword?.message}
                {...field}
              />
            )}
          />

          <Controller
            name="user_type"
            control={control}
            render={({ field }) => (
              <div className="flex gap-4 mb-4">
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 
                    rounded-lg border-2 w-full transition-all 
                    ${field.value === 'E' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => field.onChange('E')}
                >
                  <FiUser className="w-8 h-8 mb-2 text-blue-500" />
                  <span className="font-medium">Estudiante</span>
                </button>
                <button
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 
                    rounded-lg border-2 w-full transition-all 
                    ${field.value === 'P' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => field.onChange('P')}
                >
                  <FiBook className="w-8 h-8 mb-2 text-blue-500" />
                  <span className="font-medium">Profesor</span>
                </button>
              </div>
            )}
          />

          <div className="flex items-center">
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}
              disabled={isLoading}>
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </div>

          <div className="text-center mt-4">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </form>
        <ToastContainer />
      </Card>
    </div>
  );
}