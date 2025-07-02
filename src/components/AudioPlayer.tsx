'use client';

import { FiMic, FiTrash2 } from 'react-icons/fi';

interface AudioPlayerProps {
  audioUrl: string;
  onNewRecording?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onNewRecording,
  onDelete,
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Reproductor nativo */}
      <audio
        controls
        className="w-full"
        key={audioUrl}
        playsInline
      >
        <source src={audioUrl} type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>

      {/* Botones de acción */}
      <div className="flex gap-3">
        {onNewRecording && (
          <button
            onClick={onNewRecording}
            className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <FiMic />
            Grabar nuevo
          </button>
        )}

        {onDelete && (
          <button
            onClick={onDelete}
            className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <FiTrash2/>
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};
