'use client';
import { useState, useEffect } from 'react';
import { FetchData, SuccessMsj, ErrorMsj, handleInputChange } from '@/utils/Tools.tsx';
import { ToastContainer } from 'react-toastify';
import { getGlobalSession } from '@/utils/GlobalSession';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Textarea } from '@/components/Textarea';
import { Button } from '@/components/Button';
import { FiEdit, FiSave, FiUser, FiX } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import SubjectSearch from '@/components/SubjectSearch';
import ProfilePictureUploader from '@/components/ProfilePictureUploader';

export default function TeacherProfile() {
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
  const [editMode, setEditMode] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

  type SubjectModalState = {
    selectedSubject: string | null;
    isConfirming: boolean;
  };

  const [modalState, setModalState] = useState<SubjectModalState>({
    selectedSubject: null,
    isConfirming: false
  });

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
            classes: res.data.classes
          }
          setInitialData(datos);
          setFormData(datos);
        }
      }
    } catch (error: any) {
      ErrorMsj('Error al obtener los datos del perfil. Por favor, inténtalo de nuevo.');
    }
  }

  const handleLocalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleInputChange(e, formData, setFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (session) {
        const data = await FetchData('/api/teacher/profile', {
          email: session.userEmail,
          name: formData.name,
          description: formData.description,
          classes: formData.classes
        }, 'PUT');
        
        if (data.success) {
          const updatedData = {
            name: formData.name,
            description: formData.description,
            classes: formData.classes
          };
          
          setInitialData(updatedData);
          SuccessMsj(data.message);
          setEditMode(false);
        }
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

  const handleSubjectSelect = (subject: string) => {
    setModalState({
      selectedSubject: subject,
      isConfirming: true
    });
  };

  const confirmAddSubject = () => {
    if (modalState.selectedSubject && !formData.classes.includes(modalState.selectedSubject)) {
      setFormData(prev => ({
        ...prev,
        classes: [...prev.classes, modalState.selectedSubject as string]
      }));
      SuccessMsj('Materia agregada correctamente');
    } else if (modalState.selectedSubject) {
      ErrorMsj('Esta materia ya está agregada');
    }
    
    setModalState({ selectedSubject: null, isConfirming: false });
    setIsSubjectModalOpen(false);
  };

  return (
    <div className="min-h-screen flex pt-3 justify-center">
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
            {session && (
              <ProfilePictureUploader
                email={session.userEmail}
                currentImageUrl={session.userImage}
                onUploadSuccess={(url) => {
                  SuccessMsj('Foto de perfil actualizada correctamente');
                }}
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

          {/* Clases impartidas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="classes" className="block text-sm font-medium">
                Clases Impartidas
              </label>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={() => setIsSubjectModalOpen(true)}
                disabled={!editMode}
              >
                <span className="flex items-center">
                  <span className="mr-1"><FaPlus /></span> Agregar materia
                </span>
              </Button>
            </div>
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

      {isSubjectModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {modalState.isConfirming ? 'Confirmar materia' : 'Seleccionar materia'}
              </h3>
              <button 
                onClick={() => {
                  setModalState({ selectedSubject: null, isConfirming: false });
                  setIsSubjectModalOpen(false);
                }}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FiX size={20} />
              </button>
            </div>

            {modalState.isConfirming ? (
              <div className="space-y-4">
                <p>¿Agregar <span className="font-semibold">{modalState.selectedSubject}</span>?</p>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setModalState({ selectedSubject: null, isConfirming: false })}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={confirmAddSubject}
                    variant="primary"
                  >
                    Confirmar
                  </Button>
                </div>
              </div>
            ) : (
              <SubjectSearch onSubjectSelect={handleSubjectSelect} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
