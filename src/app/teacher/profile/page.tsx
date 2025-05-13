'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { FetchData, SuccessMsj, ErrorMsj, handleInputChange } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { getGlobalSession } from '@/utils/GlobalSession';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Button } from '@/components/Button';
import { FiEdit, FiSave, FiUser, FiX } from 'react-icons/fi';

export default function TeacherProfile() {
  // Crear variables de estado
  const session = getGlobalSession();
  const [initialData, setInitialData] = useState<{
    name: string;
    description: string;
    classes: string[];
  } | null>(null);
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
  const [editMode, setEditMode] = useState(false);


  useEffect(() => {
    GetTeacherData();
  }, []);

  async function GetTeacherData() {
    try {
      if (session) {
        const res = await FetchData('/api/teacher/profile', {
          email: session.userEmail
        });
        if (res) {
          const datos = {
            name: res.name,
            description: res.data.description,
            classes: ['inglés']
          }
          setInitialData(datos);
          setFormData(datos);
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

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setEditMode(false);
  };

  return (
    <div className="min-h-screen flex pt-3 justify-center">
      <ToastContainer />
      <Card title="Perfil del Profesor" icon={<FiUser className="text-blue-500" />} className="max-w-2xl w-full h-fit">
        <div className="flex gap-2 mb-4">
          {editMode ? (
            <Button
              type="submit"
              children="Guardar"
              icon={<FiSave />}
            />
          ) : (
            <Button
              type="button"
              onClick={() => setEditMode(true)}
              children="Editar"
              icon={<FiEdit />}
            />
          )}
          {editMode && (
            <Button
              onClick={() => handleCancel()}
              children="Cancelar"
              icon={<FiX />}
              variant="danger"
            />
          )}
        </div>
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
              disabled={!editMode}
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
            disabled={!editMode}
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
        </form>
      </Card>
    </div>
  );
}
