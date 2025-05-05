'use client';

import React, { useState, FormEvent } from 'react';

interface FormData {
  name: string;
  email: string;
  password: string;
  userType: 'E' | 'P'; // El tipo de usuario, incluyendo un estado inicial vacío
}

// Define la interfaz para los posibles errores de validación
interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  userType?: string;
  general?: string; // Para errores generales de envío
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Limpiar el error de ese campo al escribir
    setErrors(prevErrors => ({ ...prevErrors, [name]: undefined }));
  };

  // Función de validación básica
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
    } else if (formData.password.length < 6) { // Ejemplo: mínimo 6 caracteres
       newErrors.password = 'La contraseña debe tener al menos 6 caracteres.';
    }
    if (!formData.userType) {
      newErrors.userType = 'Debes seleccionar un tipo de usuario.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Retorna true si no hay errores
  };

  // Manejador del envío del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario

    setErrors({}); // Limpiar errores anteriores
    setSuccessMessage(null); // Limpiar mensaje de éxito

    // Validar antes de enviar
    if (!validateForm()) {
      return; // Si hay errores de validación, detener el envío
    }

    setIsLoading(true); // Activar estado de carga

    // --- Simular envío a una API (reemplaza esto con tu lógica real) ---
    console.log('Enviando datos:', formData);

    try {
      // Aquí harías una llamada a tu API, por ejemplo con fetch:
      // const response = await fetch('/api/register', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      //
      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.message || 'Error en el registro');
      // }
      //
      // const result = await response.json();
      // console.log('Registro exitoso:', result);

      // Simulación de una respuesta exitosa con un delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccessMessage('¡Registro exitoso! Revisa tu correo.'); // Mostrar mensaje de éxito
      setFormData({ name: '', email: '', password: '', userType: 'P' }); // Limpiar formulario

    } catch (error: any) {
      console.error('Error al registrar:', error);
      setErrors({ general: error.message || 'Ocurrió un error al registrar.' }); // Mostrar error general
    } finally {
      setIsLoading(false); // Desactivar estado de carga
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-md w-full rounded-lg shadow-md p-8" style={{ background: 'var(--background)', border: '1px solid var(--foreground)', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: 'var(--foreground)' }}>Registro</h2>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error general */}
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo Nombre */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Nombre:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`shadow appearance-none border ${errors.name ? 'border-red-500' : ''} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`}
              style={{ background: 'var(--background)', color: 'var(--foreground)', borderColor: errors.name ? '' : 'var(--foreground)' }}
              required
            />
            {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
          </div>

          {/* Campo Correo */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Correo Electrónico:
            </label>
            <input
              type="email" // Usa type="email" para validación básica del navegador
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`shadow appearance-none border ${errors.email ? 'border-red-500' : ''} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`}
              style={{ background: 'var(--background)', color: 'var(--foreground)', borderColor: errors.email ? '' : 'var(--foreground)' }}
              required
            />
             {errors.email && <p className="text-red-500 text-xs italic mt-1">{errors.email}</p>}
          </div>

          {/* Campo Contraseña */}
          <div className="mb-6"> {/* Usa mb-6 para más espacio antes del botón */}
            <label htmlFor="password" className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
               className={`shadow appearance-none border ${errors.password ? 'border-red-500' : ''} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`}
              style={{ background: 'var(--background)', color: 'var(--foreground)', borderColor: errors.password ? '' : 'var(--foreground)' }}
              required
            />
             {errors.password && <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>}
          </div>

          {/* Campo Tipo de Usuario (Dropdown) */}
          <div className="mb-6">
            <label htmlFor="userType" className="block text-sm font-bold mb-2" style={{ color: 'var(--foreground)' }}>
              Tipo de Usuario:
            </label>
            <select
              id="userType"
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className={`shadow appearance-none border ${errors.userType ? 'border-red-500' : ''} rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline`}
              style={{ background: 'var(--background)', color: 'var(--foreground)', borderColor: errors.userType ? '' : 'var(--foreground)' }}
              required
            >
              <option value="" disabled>Selecciona una opción</option> {/* Opción por defecto deshabilitada */}
              <option value="P">Profesor</option>
              <option value="E">Estudiante</option>
            </select>
            {errors.userType && <p className="text-red-500 text-xs italic mt-1">{errors.userType}</p>}
          </div>

          {/* Botón de Envío */}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isLoading} // Deshabilitar el botón mientras se envía
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;