'use client';
import { useState, useEffect, Suspense, lazy } from 'react';
import { FetchData, SuccessMsj, ErrorMsj } from '@/utils/Tools.tsx';
import { Card, Input, Textarea, Button } from '@/components';
import { ProfilePictureUploader, ImageModal } from '@/components';
import { InternationalPhoneInput } from '@/components/PhoneInput';
import { FiEdit, FiSave, FiUser, FiX, FiAlignLeft, FiMapPin, FiPhone } from 'react-icons/fi';
import { useCountries } from '@/providers';
import { useUser } from '@/providers/UserProvider';
import type { CountryCode, E164Number } from 'libphonenumber-js';

// Lazy load CountrySelector
const CountrySelector = lazy(() => import('@/components').then(mod => ({ default: mod.CountrySelector })));

export interface StudentProfileProps {
  name: string;
  image: string;
  description: string;
  country: string;
  number: string;
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
    country: '',
    number: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const { getCountryByCode } = useCountries();
  const { setUserName, setUserNumber } = useUser();

  useEffect(() => {
    async function GetStudentData() {
      try {
        const profileRes = await FetchData<StudentProfileProps>('/api/student/profile', {}, 'GET')
        if (profileRes) {
          const datos = {
            name: profileRes.name,
            image: profileRes.image,
            description: profileRes.description || '',
            country: profileRes.country,
            number: profileRes.number || ''
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
        country: formData.country,
        number: formData.number
      }, 'PUT');

      if (data.success) {
        const updatedData: StudentProfileProps = {
          name: formData.name,
          image: formData.image,
          description: formData.description,
          country: formData.country,
          number: formData.number
        };
        setInitialData(updatedData);
        setUserName(formData.name);
        setUserNumber(formData.number);
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
    <div className="flex items-center justify-center space-y-3">
      <div className="mt-3 max-w-4xl w-full">
        <Card title="Perfil del Estudiante" fullWidth icon={<FiUser className="text-blue-500" />} className="h-fit">
          <form onSubmit={handleSubmit} className="space-y-4">
            {editMode ? (
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
            ) : (
              <div className="flex gap-2 mb-4">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setEditMode(true);
                  }}
                  icon={<FiEdit />}
                >
                  Editar
                </Button>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>

            <div className='grid md:grid-cols-2 gap-4 '>
              <div>
                {/* Sección de foto de perfil */}
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
                {/* Descripción Grande */}
                <div className='hidden md:block'>
                  <div className="flex items-center gap-1 mb-1 mt-3">
                    <FiAlignLeft className="text-blue-500" />
                    <label className="block text-sm font-medium">
                      Descripción Breve
                    </label>
                  </div>

                  <Textarea
                    id="description"
                    placeholder="Escribe una breve descripción de ti"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    disabled={!editMode}
                  />
                </div>
              </div>
              <div>
                {/* Nombre Grande */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1">
                    <FiUser className="text-blue-500" />
                    <label className="block text-sm font-medium">
                      Nombre
                    </label>
                  </div>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Tu nombre completo"
                    disabled={!editMode}
                  />
                </div>
                {/* Descripción Pequeña */}
                <div className='md:hidden'>
                  <div className="flex items-center gap-1 mb-1 mt-3">
                    <FiAlignLeft className="text-blue-500" />
                    <label className="block text-sm font-medium">
                      Descripción Breve
                    </label>
                  </div>

                  <Textarea
                    id="description"
                    placeholder="Escribe una breve descripción de ti"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    disabled={!editMode}
                  />
                </div>

                {/* País */}
                <div className="flex items-center gap-1 mb-1.5 mt-3">
                  <FiMapPin className="text-blue-500" />
                  <label className="block text-sm font-medium">
                    País
                  </label>
                </div>
                {editMode ? (
                  <Suspense fallback={<div className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800">Loading country selector...</div>}>
                    <CountrySelector
                      value={formData.country || ''}
                      onChange={(countryCode: string) => setFormData({ ...formData, country: countryCode })}
                      className="w-full"
                    />
                  </Suspense>
                ) : (
                  <div className="p-2 border rounded-md border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 flex items-center gap-2 min-h-10 cursor-not-allowed">
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
                {/* Numero */}
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-1.5 mt-3">
                    <FiPhone className="text-blue-500" />
                    <label className="block text-sm font-medium">
                      Número
                    </label>
                  </div>
                  <InternationalPhoneInput
                    value={formData.number as E164Number | undefined}
                    onChange={(number) => setFormData({ ...formData, number: number?.toString() || '' })}
                    disabled={!editMode}
                    defaultCountry={formData.country as CountryCode || 'DO'}
                  />
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}