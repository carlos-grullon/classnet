'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FetchData, SuccessMsj, ErrorMsj } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { getGlobalSession } from '@/utils/GlobalSession';

export default function TeacherProfile() {
  const session = getGlobalSession();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    classes: string[];
  }>({
    name: '',
    description: '',
    classes: [],
  });
  const [imageUrl, setImageUrl] = useState('/default-avatar.png');
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    GetTeacherData();
  }, []);
  async function GetTeacherData() {
    try {
      if (session) {
        const data = await FetchData('/api/teacher/profile', {
          email: session.userEmail
        });
        if (data) {
          setFormData(
            {
              name: data.username,
              description: data.data.description,
              classes: ["Inglés", "Programación", "Calistenia"]//data.data.classes
            }
          );
        }
      }
    } catch (error: any) {
      ErrorMsj('Error al obtener los datos del perfil. Por favor, inténtalo de nuevo.', error);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los datos
    console.log('Form data:', formData);
    console.log('Image:', previewUrl);
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <ToastContainer />
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6" style={{ background: 'var(--background-soft)', color: 'var(--foreground-muted)' }}>
        <h1 className="text-2xl font-bold mb-6">Perfil del Profesor</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Foto de Perfil</label>
            <div className="flex items-center space-x-4">
              <div className="relative w-24 h-24">
                <Image
                  src={previewUrl || imageUrl}
                  alt="Profile"
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-md"
              style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
            />
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Descripción Breve
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border rounded-md"
              style={{ background: 'var(--input-background)', color: 'var(--foreground)' }}
            />
          </div>

          {/* Clases impartidas */}
          <div className="space-y-2">
            <label htmlFor="classes" className="block text-sm font-medium">
              Clases Impartidas
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.classes.map((className, index) => (
                <span
                  key={index}
                  className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 font-semibold rounded-full text-sm"
                >
                  {className}
                </span>
              ))}
              {formData.classes.length === 0 && (
                <span className="text-sm italic" style={{ color: 'var(--foreground-subtle)' }}>
                  No hay clases registradas
                </span>
              )}
            </div>

          </div>

          {/* Botón de guardar */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}
