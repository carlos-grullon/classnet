'use client';
import { useState, useEffect } from 'react';
import { FetchData, SuccessMsj, ErrorMsj, handleInputChange } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { Card, Input, Textarea, Button } from '@/components';
import { ProfilePictureUploader, ImageModal } from '@/components';
import { FiEdit, FiSave, FiUser, FiX } from 'react-icons/fi';
import { SubjectSearch } from '@/components';
import { FaPlus } from 'react-icons/fa';
import { Subject } from '@/interfaces';

export default function TeacherProfile() {
  
  const [initialData, setInitialData] = useState<{
    name: string;
    description: string;
    subjects: Array<{ category: string; code: string }>;
  } | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    subjects: Array<{ category: string; code: string }>;
  }>({
    name: '',
    description: '',
    subjects: []
  });
  const [editMode, setEditMode] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isSubjectSearchOpen, setIsSubjectSearchOpen] = useState(false);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);

  useEffect(() => {
    GetTeacherData();
  }, []);

  async function GetTeacherData() {
    try {
      const [profileRes, subjectsRes] = await Promise.all([
        FetchData('/api/teacher/profile', {}),
        FetchData('/api/subjects', {}, 'GET')
      ]);
      
      if (profileRes && subjectsRes) {
        const datos = {
            name: profileRes.name,
            description: profileRes.data.description || '',
            subjects: profileRes.data.subjects || []
          };
          setAllSubjects(subjectsRes.subjects || subjectsRes);
          setInitialData(datos);
          setFormData(datos);
        }
    } catch (error: any) {
      ErrorMsj('Error al obtener los datos del perfil');
    }
  }

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, formData, setFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const data = await FetchData('/api/teacher/profile', {
          name: formData.name,
          description: formData.description,
          subjects: formData.subjects
        }, 'PUT');

        if (data.success) {
          const updatedData = {
            name: formData.name,
            description: formData.description,
            subjects: formData.subjects
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

  const removeSubject = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="grid grid-cols-3">
      <div></div>
      <div className="min-h-screen flex pt-3 ">
        <ToastContainer />
        <Card title="Perfil del Profesor" icon={<FiUser className="text-blue-500" />} className="max-w-2xl w-full h-fit">
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
                  email={session.userEmail}
                  currentImageUrl={session.userImage}
                  onUploadSuccess={(url) => {
                    SuccessMsj('Foto de perfil actualizada correctamente');
                  }}
                  editMode={editMode}
                  onImageClick={() => session?.userImage && setIsImageModalOpen(true)}
                />
              {isImageModalOpen && (
                <ImageModal
                  imageUrl={session?.userImage}
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

            {/* Materias */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Materias
                </label>
                {editMode && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSubjectSearchOpen(true)}
                  >
                    <span className="flex items-center">
                      <FaPlus className="mr-1" /> Agregar
                    </span>
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.subjects.length === 0 ? (
                  <span className="text-sm text-gray-500">No hay materias asignadas</span>
                ) : (
                  formData.subjects.map((subject, index) => {
                    const fullSubject = allSubjects.find(s => 
                      s.category === subject.category && 
                      s.code === subject.code
                    );
                    
                    return (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        title={`${subject.category} - ${subject.code}`}
                      >
                        {fullSubject?.name || `${subject.category}-${subject.code}`}
                        {editMode && (
                          <button 
                            onClick={() => removeSubject(index)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <FiX size={14} />
                          </button>
                        )}
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </form>
        </Card>
      </div>
      <div></div>
      <SubjectSearch 
        isOpen={isSubjectSearchOpen}
        onClose={() => setIsSubjectSearchOpen(false)}
        onSelect={(subject) => {
          // Verificar si ya existe
          const exists = formData.subjects.some(
            s => s.category === subject.category && s.code === subject.code
          );
          
          if (!exists) {
            setFormData(prev => ({
              ...prev,
              subjects: [...prev.subjects, subject]
            }));
          } else {
            alert('Esta materia ya fue agregada');
          }
        }}
      />
    </div>
  );
}
