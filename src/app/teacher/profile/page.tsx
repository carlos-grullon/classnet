'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FetchData, SuccessMsj, ErrorMsj, handleInputChange } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { getGlobalSession } from '@/utils/GlobalSession';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { FiUser } from 'react-icons/fi';

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
              name: data.name,
              description: data.data.description,
              classes: ["Inglés", "Programación", "Calistenia"]//data.data.classes
            }
          );
        }
      }
    } catch (error: any) {
      ErrorMsj('Error al obtener los datos del perfil. Por favor, inténtalo de nuevo.');
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, formData, setFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí iría la lógica para guardar los datos
    console.log('Form data:', formData);
    console.log('Image:', previewUrl);
  };

  return (
    <div className="min-h-screen flex pt-3 justify-center">
      <ToastContainer />
      <Card title="Perfil del Profesor" icon={<FiUser className="text-blue-500" />} className="max-w-2xl w-full h-fit">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto de perfil */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Foto de Perfil</label>
            <div className="flex items-center space-x-4">
              <div className="relative w-32 h-24">
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
            <Input
              id="name"
              name="name"
              type="text"
              label="Nombre"
              value={formData.name}
              onChange={handleLocalInputChange}
              placeholder="Tu nombre completo"
            />
          </div>

          {/* Descripción */}
          <Textarea
            id="description"
            name="description"
            label="Descripción Breve"
            placeholder="Escribe una breve descripción de ti"
            value={formData.description}
            onChange={handleLocalInputChange}
            rows={4}
          />

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
                <span className="text-sm italic">
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
      </Card>
    </div>
  );
}
