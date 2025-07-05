'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import { FetchData, SuccessMsj, ErrorMsj } from '@/utils/Tools.tsx';
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
interface StudentPostResponse {
  success: boolean;
  message: string;
  updatedFields: { name: string; description: string; country: string };
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
        const profileRes = await FetchData<StudentProfileProps>('/api/student/profile', {}, 'GET')
        if (profileRes) {
          const datos = {
            name: profileRes.name,
            image: profileRes.image,
            description: profileRes.description || '',
            country: profileRes.country
          };
          setInitialData(datos);
          setFormData(datos);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error al obtener los datos del perfil';
        ErrorMsj(message);
      }
    }
    GetStudentData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await FetchData<StudentPostResponse>('/api/student/profile', {
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      ErrorMsj(message);
    }
  };

  const handleCancel = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setEditMode(false);
  };

  const handleUploadSuccess = async (url: string) => {
    try {
      const updatedData = {
        ...formData,
        image: url
      };
      setInitialData(updatedData);
      setFormData(updatedData);
      setEditMode(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      ErrorMsj(message);
    }
  };

  return (
    <div className="grid md:grid-cols-3 space-y-3">
      <div></div>
      <div className="min-h-screen flex">
        <Card title="Perfil del Estudiante" icon={<FiUser className="text-blue-500" />} className="max-w-2xl w-full h-fit">
          {!editMode && (
            <div className="flex gap-2 mb-4">
              <Button
                type="button"
                onClick={() => setEditMode(true)}
                icon={<FiEdit />}
              >
                Editar
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {editMode && (
              <div className="flex gap-2 mb-4">
                <Button
                  type="submit"
                  icon={<FiSave />}
                >
                  Guardar
                </Button>
                <Button
                  type="button"
                  onClick={handleCancel}
                  icon={<FiX />}
                  variant="danger"
                >
                  Cancelar
                </Button>
              </div>
            )}

            {/* Sección de foto de perfil */}
            <div className="space-y-2 md:hidden flex flex-col items-center rounded-lg">
              <label className="block text-sm font-medium">
                Foto de perfil
              </label>
              <ProfilePictureUploader
                currentImageUrl={formData.image}
                onUploadSuccess={handleUploadSuccess}
                editMode={editMode}
                onImageClick={() => setIsImageModalOpen(true)}
                className="h-40 w-40"
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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
      <div className="md:block hidden">
        <Card>
          <div className="space-y-2 flex flex-col items-center rounded-lg">
            <label className="block text-sm font-medium">
              Foto de perfil
            </label>
            <ProfilePictureUploader
              currentImageUrl={formData.image}
              onUploadSuccess={handleUploadSuccess}
              editMode={editMode}
              onImageClick={() => setIsImageModalOpen(true)}
              className="h-40 w-40"
            />
            {isImageModalOpen && (
              <ImageModal
                imageUrl={formData.image}
                onClose={() => setIsImageModalOpen(false)}
                altText="Foto de perfil"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}