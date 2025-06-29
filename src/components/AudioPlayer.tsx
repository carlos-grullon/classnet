'use client';

import { useRef, useState, useEffect } from 'react';
import { FiPlay, FiPause, FiTrash2, FiMic } from 'react-icons/fi';

interface AudioPlayerProps {
  audioUrl: string;
  onDelete?: () => void;
  onNewRecording?: () => void;
  className?: string;
}

export const AudioPlayer = ({
  audioUrl,
  onDelete,
  onNewRecording,
  className = ''
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    
    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioUrl]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          onClick={togglePlay}
          className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-600 dark:text-blue-300"
        >
          {isPlaying ? <FiPause /> : <FiPlay />}
        </button>
        
        <div className="flex-1 flex items-center gap-2 text-sm">
          <span className="text-gray-600 dark:text-gray-300">
            {formatTime(currentTime)}
          </span>
          <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500" 
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
          <span className="text-gray-500 dark:text-gray-400">
            {formatTime(duration)}
          </span>
        </div>
        
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          onEnded={() => setIsPlaying(false)}
          hidden
        />
      </div>
      
      <div className="flex gap-3 mt-2">
        {onNewRecording && (
          <button
            onClick={onNewRecording}
            className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-md bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
          >
            <FiMic size={14} />
            Grabar nuevo
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-sm flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <FiTrash2 size={14} />
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};
