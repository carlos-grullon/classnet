import { Button, Badge } from '@/components';
import { FiDownload, FiPlay, FiMessageSquare } from 'react-icons/fi';

type SubmissionDetails = {
  fileUrl?: string;
  fileName?: string;
  audioUrl?: string;
  message?: string;
  createdAt: Date;
  fileGrade?: number;
  fileFeedback?: string;
  audioGrade?: number;
  audioFeedback?: string;
  overallGrade?: number;
  overallFeedback?: string;
  isGraded: boolean;
  studentName: string;
};

type SubmissionDetailsViewProps = {
  submission: SubmissionDetails;
  onGradeClick: () => void;
};

export function SubmissionDetailsView({ submission, onGradeClick }: SubmissionDetailsViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">Detalles de la Entrega de <span className="text-blue-600 font-bold">{submission.studentName}</span></h3>
          <p className="text-sm text-gray-500">
            Enviado el: {new Date(submission.createdAt).toLocaleDateString()}
          </p>
        </div>
        <Badge className={`${submission.isGraded ? 'bg-green-500' : 'bg-yellow-500'}`}>
          {submission.isGraded ? 'Calificado' : 'Pendiente'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {submission.fileUrl && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium flex items-center gap-2">
              <FiDownload /> Archivo Entregado
            </h4>
            <div className="mt-2">
              <a 
                href={submission.fileUrl} 
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {submission.fileName || 'Ver archivo'}
              </a>
            </div>
            {submission.fileGrade !== undefined && (
              <div className="mt-3">
                <p className="text-sm">Calificación: <span className="font-medium">{submission.fileGrade}/100</span></p>
                {submission.fileFeedback && (
                  <p className="text-sm mt-1">Feedback: {submission.fileFeedback}</p>
                )}
              </div>
            )}
          </div>
        )}

        {submission.audioUrl && (
          <div className="border rounded-lg p-4">
            <h4 className="font-medium flex items-center gap-2">
              <FiPlay /> Audio Entregado
            </h4>
            <div className="mt-2">
              <audio controls className="w-full" key={submission.audioUrl}>
                <source src={submission.audioUrl} type="audio/mpeg" />
              </audio>
            </div>
            {submission.audioGrade !== undefined && (
              <div className="mt-3">
                <p className="text-sm">Calificación: <span className="font-medium">{submission.audioGrade}/100</span></p>
                {submission.audioFeedback && (
                  <p className="text-sm mt-1">Feedback: {submission.audioFeedback}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {submission.message && (
        <div className="border rounded-lg p-4">
          <h4 className="font-medium flex items-center gap-2">
            <FiMessageSquare /> Mensaje del Estudiante
          </h4>
          <p className="mt-2 whitespace-pre-line">{submission.message}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button onClick={onGradeClick}>
          {submission.isGraded ? 'Editar Calificación' : 'Agregar Calificación'}
        </Button>
      </div>
    </div>
  );
}
