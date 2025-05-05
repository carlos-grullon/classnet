'use client';

import React, { useState, FormEvent } from 'react';
import { AuthCard } from '@/components/auth/AuthCard';
import { FormInput } from '@/components/forms/FormInput';
import { FormSelect } from '@/components/forms/FormSelect';

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
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('¡Registro exitoso! Revisa tu correo.');
      setFormData({ name: '', email: '', password: '', userType: 'P' });
    } catch (error: any) {
      console.error('Error al registrar:', error);
      setErrors({ general: error.message || 'Ocurrió un error al registrar.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Registro"
      error={errors.general}
      success={successMessage}
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          id="name"
          name="name"
          label="Nombre:"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          required
        />

        <FormInput
          id="email"
          name="email"
          type="email"
          label="Correo Electrónico:"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          required
        />

        <FormInput
          id="password"
          name="password"
          type="password"
          label="Contraseña:"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          required
        />

        <FormSelect
          id="userType"
          name="userType"
          label="Tipo de Usuario:"
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

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
        </div>
      </form>
    </AuthCard>
  );
};

export default RegisterForm;