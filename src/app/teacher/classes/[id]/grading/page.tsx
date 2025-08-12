"use client";
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { GradeAssignmentForm, SubmissionDetailsView, Badge } from '@/components';
import { getDayName } from '@/utils/GeneralTools';
import { ErrorMsj, FetchData, SuccessMsj } from '@/utils/Tools.tsx';

type Submission = {
  _id: string;
  studentId: string;
  studentName: string;
  weekNumber: number;
  day: string;
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  message?: string;
  isGraded: boolean;
  overallGrade?: number;
  submittedAt: Date | string | null;
};

export default function ClassGradingPage() {
  const { id: classId } = useParams();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [submissionDetails, setSubmissionDetails] = useState<Submission | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Obtener todas las entregas de la clase
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await FetchData<{ submissions: Submission[] }>(
          `/api/classes/${classId}/submissions`,
          {},
          'GET'
        );
        setSubmissions(response.submissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [classId]);

  // Obtener detalles de una entrega específica
  const fetchSubmissionDetails = async (submissionId: string, day: string) => {
    try {
      const response = await FetchData<{ success: boolean, data: Submission }>(
        `/api/assignments/submissions/${submissionId}?day=${encodeURIComponent(day)}`,
        {},
        'GET'
      );
      if (response.success) {
        setSubmissionDetails(response.data);
      }
    } catch (error) {
      console.error('Error fetching submission details:', error);
    }
  };

  // Guardar calificación
  const handleSaveGrade = async (gradeData: {
    fileGrade?: number;
    fileFeedback?: string;
    audioGrade?: number;
    audioFeedback?: string;
    overallGrade?: number;
    overallFeedback?: string;
  }) => {
    try {
      if (!selectedSubmission) return;
      await FetchData(
        `/api/assignments/grade`,
        {
          submissionId: selectedSubmission._id,
          day: selectedSubmission.day,
          ...gradeData
        },
        'POST'
      );

      // Actualizar el estado local
      setSubmissions(prev => prev.map(sub =>
        sub._id === selectedSubmission._id && sub.day === selectedSubmission.day
          ? { ...sub, ...gradeData, isGraded: true }
          : sub
      ));
      setSubmissionDetails(prev => prev ? { ...prev, ...gradeData, isGraded: true } : null);
      setIsEditing(false);

      // Mostrar notificación de éxito
      SuccessMsj('Calificación guardada correctamente');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al guardar la calificación';
      console.error(message, error);
      ErrorMsj(message);
    }
  };

  const filteredSubmissions = submissions.filter(sub => {
    if (activeTab === 'all') return true;
    if (activeTab === 'graded') return sub.isGraded;
    if (activeTab === 'pending') return !sub.isGraded;
    return true;
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Calificaciones de la Clase</h1>

      <div className="mb-6">
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value)}
          className="p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">Todas las entregas</option>
          <option value="graded">Entregas calificadas</option>
          <option value="pending">Entregas pendientes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h2 className="text-lg font-semibold mb-4">Entregas</h2>
          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="space-y-2">
              {filteredSubmissions.length === 0 ? (
                <p className="text-gray-500">No hay entregas {activeTab !== 'all' ? activeTab === 'graded' ? 'calificadas' : 'pendientes' : ''}</p>
              ) : (
                filteredSubmissions.map(sub => (
                  <div
                    key={sub._id + sub.day}
                    onClick={() => {
                      setSelectedSubmission(sub);
                      fetchSubmissionDetails(sub._id, sub.day);
                      setIsEditing(false);
                    }}
                    className={`p-3 rounded-lg cursor-pointer ${selectedSubmission?._id === sub._id ? 'bg-blue-50 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Semana {sub.weekNumber} • {getDayName([sub.day])}</span>
                      <Badge className={`${sub.isGraded ? 'bg-green-500' : 'bg-yellow-500'}`}>
                        {sub.isGraded ? 'Calificado' : 'Pendiente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{sub.studentName}</p>
                    {sub.overallGrade !== undefined && (
                      <p className="text-sm mt-1">Nota: {sub.overallGrade}/100</p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          {selectedSubmission ? (
            isEditing ? (
              <GradeAssignmentForm
                submissionId={selectedSubmission._id}
                initialData={submissionDetails}
                onCancel={() => setIsEditing(false)}
                onSave={handleSaveGrade}
              />
            ) : submissionDetails ? (
              <SubmissionDetailsView
                submission={submissionDetails}
                onGradeClick={() => setIsEditing(true)}
              />
            ) : (
              <div>Loading details...</div>
            )
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">Selecciona una entrega para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
