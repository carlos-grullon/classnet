'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import { FetchData, SuccessMsj, ErrorMsj, handleInputChange } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { Card, Input, Textarea, Button } from '@/components';
import { ProfilePictureUploader, ImageModal } from '@/components';
import { FiEdit, FiSave, FiUser, FiX } from 'react-icons/fi';
import { useCountries } from '@/providers';

// Lazy load CountrySelector
const CountrySelector = lazy(() => import('@/components').then(mod => ({ default: mod.CountrySelector })));

export interface StudentProfileProps {
  name: string;
  image: string;
  description: string;
  country: string;
}

export default function StudentProfile() {

  const [initialData, setInitialData] = useState<StudentProfileProps | null>(null);
  const [formData, setFormData] = useState<StudentProfileProps>({
    name: '',
    image: '',
    description: '',
    country: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { getCountryByCode } = useCountries();

  useEffect(() => {
    async function GetStudentData() {
      try {
        const profileRes = await FetchData('/api/student/profile', {}, 'GET')
        if (profileRes) {
          const datos: StudentProfileProps = {
            name: profileRes.name,
            image: profileRes.image,
            description: profileRes.description || '',
            country: profileRes.country
          };
          console.log(datos);
          setInitialData(datos);
          setFormData(datos);
        }
      } catch (error: any) {
        ErrorMsj('Error al obtener los datos del perfil');
      }
    }
    GetStudentData();
  }, []);

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, formData, setFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await FetchData('/api/student/profile', {
        name: formData.name,
        description: formData.description,
        country: formData.country
      }, 'PUT');

      if (data.success) {
        const updatedData: StudentProfileProps = {
          name: formData.name,
          image: formData.image,
          description: formData.description,
          country: formData.country
        };

        setInitialData(updatedData);
        SuccessMsj(data.message);
        setEditMode(false);
      }
    } catch (error: any) {
      ErrorMsj(error.message);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setEditMode(false);
  };
  return (
    <div className="grid grid-cols-3">
      <div></div>
      <div className="min-h-screen flex pt-3 ">
        <ToastContainer />
        <Card title="Perfil del Estudiante" icon={<FiUser className="text-blue-500" />} className="max-w-2xl w-full h-fit">
          {!editMode && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                onClick={() => setEditMode(true)}
                children="Editar"
                icon={<FiEdit />}
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {editMode && (
              <div className="flex gap-2 mb-4">
                <Button
                  type="submit"
                  children="Guardar"
                  icon={<FiSave />}
                />
                <Button
                  type="button"
                  onClick={handleCancel}
                  children="Cancelar"
                  icon={<FiX />}
                  variant="danger"
                />
              </div>
            )}

            {/* Sección de foto de perfil */}
            <div className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Foto de perfil
              </label>
              <ProfilePictureUploader
                currentImageUrl={formData.image}
                onUploadSuccess={(url) => {
                  setFormData(prev => ({ ...prev, image: url }));
                  SuccessMsj('Foto de perfil actualizada correctamente');
                }}
                editMode={editMode}
                onImageClick={() => formData.image && setIsImageModalOpen(true)}
              />
              {isImageModalOpen && (
                <ImageModal
                  imageUrl={formData.image}
                  onClose={() => setIsImageModalOpen(false)}
                  altText="Foto de perfil"
                />
              )}
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

            {/* Pais */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                País
              </label>
              {editMode ? (
                <Suspense fallback={<div className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800">Loading country selector...</div>}>
                  <CountrySelector
                    value={formData.country || ''}
                    onChange={(countryCode: string) => setFormData({ ...formData, country: countryCode })}
                    className="w-full"
                  />
                </Suspense>
              ) : (
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-700 flex items-center gap-2 min-h-10 cursor-not-allowed">
                  {formData.country ? (
                    <>
                      <span className="text-lg">
                        {getCountryByCode(formData.country)?.flag}
                      </span>
                      <span>{getCountryByCode(formData.country)?.name.common}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">No especificado</span>
                  )}
                </div>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}