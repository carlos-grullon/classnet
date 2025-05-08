'use client';

import React, { useState, FormEvent } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { FormSelect } from '@/components/forms/FormSelect';
import { Button } from '@/components/Button';
import { CrearCookie, FetchData, ErrorMsj } from '@/utils/Tools.tsx';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ToastContainer } from 'react-toastify';
import ThemeToggle from '@/components/ThemeToggle';
import { FiUserPlus } from 'react-icons/fi';

interface FormData {
  name: string;
  email: string;
  password: string;
  userType: 'E' | 'P';
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  userType?: string;
  general?: string;
}

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    userType: 'P',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido.';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'El correo es requerido.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El correo no es válido.';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (!formData.userType) {
      newErrors.userType = 'Debes seleccionar un tipo de usuario.';
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
      const data = await FetchData("/api/register", {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        user_type: formData.userType
      });

      setSuccessMessage('¡Registro exitoso! Redirigiendo...');
      setFormData({ name: '', email: '', password: '', userType: 'P' });

      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/login');
      }, 1000);

    } catch (error: any) {
      console.error('Error al registrar:', error);
      setErrors({ general: error.message || 'Ocurrió un error al registrar.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemeToggle className="fixed top-4 right-4 hover:scale-110 transition-all duration-200 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300 rounded-full" />
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card title="Registro" icon={<FiUserPlus className="text-blue-500" />}>
          <ToastContainer />
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md">
              {successMessage}
            </div>
          )}
          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md">
              {errors.general}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <Input
              id="name"
              label="Nombre"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange(e)}
              error={errors.name}
              required
            />

            <Input
              id="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange(e)}
              error={errors.email}
              required
            />

            <Input
              id="password"
              label="Contraseña"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange(e)}
              error={errors.password}
              required
            />

            <FormSelect
              id="userType"
              name="userType"
              label="Tipo de Usuario"
              value={formData.userType}
              onChange={handleInputChange}
              error={errors.userType}
              required
              placeholder="Selecciona una opción"
              options={[
                { value: 'P', label: 'Profesor' },
                { value: 'E', label: 'Estudiante' }
              ]}
            />

            <div className="flex items-center">
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Registrando...' : 'Registrarse'}
              </Button>
            </div>
          </form>
          <div className="mt-4 text-center text-sm">
            ¿Ya tienes cuenta? 
            <Link href="/login" className="text-blue-500 hover:text-blue-700 ml-1">
              Inicia sesión aquí
            </Link>
          </div>
        </Card>
      </div>
    </>
  );
};

export default RegisterForm;