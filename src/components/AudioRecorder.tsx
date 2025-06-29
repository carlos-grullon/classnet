'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiMic, FiPlay, FiPause, FiSquare, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { ErrorMsj } from '@/utils/Tools.tsx';

interface AudioRecorderProps {
  onRecordingComplete?: (audioUrl: string) => void;
  path?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete,
  path = '' 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // Inicializar AudioContext al montar el componente
  useEffect(() => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtxRef.current = ctx;
    
    // Configurar nodos iniciales pero silenciados
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0; // Silenciar inicialmente
    gainNodeRef.current = gainNode;
    
    // Pre-warm audio processing with dummy oscillator
    const oscillator = ctx.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.value = 440;
    oscillator.connect(gainNode);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.1);
    
    return () => {
      if (ctx.state !== 'closed') {
        try {
          ctx.close();
        } catch (error) {
          console.warn('Error closing AudioContext:', error);
        }
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!audioCtxRef.current) return;
      
      // Mostrar cuenta regresiva visual (3...2...1)
      setCountdown(3);
      
      // Iniciar la configuración del audio EN PARALELO con el contador
      const setupPromise = (async () => {
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 2.0;
        }
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = audioCtxRef.current;
        if (!audioContext) {
          throw new Error('AudioContext no está disponible');
        }

        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;

        source.connect(gainNodeRef.current!);
        gainNodeRef.current!.connect(analyser);

        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
        };
      })();
      
      // Animación del contador visual
      for (let i = 3; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCountdown(i - 1);
      }
      
      // Esperar que termine la configuración del audio si no ha terminado
      await setupPromise;
      
      setCountdown(null);
      setIsRecording(true);
      setIsPaused(false);
      setTime(0);
      
      mediaRecorderRef.current?.start();
      intervalRef.current = setInterval(() => setTime(prev => prev + 1), 1000);
      drawWaves();
    } catch (error) {
      setCountdown(null);
      const message = error instanceof Error ? error.message : 'Error al acceder al micrófono';
      ErrorMsj(message);
      console.error('Error al acceder al micrófono:', error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      intervalRef.current = setInterval(() => setTime((prev) => prev + 1), 1000);
      drawWaves();
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  };

  const drawWaves = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext('2d');
    if (!canvas || !canvasCtx || !analyserRef.current || !dataArrayRef.current || countdown !== null) return;
    
    const draw = () => {
      analyserRef.current!.getByteFrequencyData(dataArrayRef.current!);
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barCount = 32;
      const barWidth = canvas.width / barCount;
      const centerY = canvas.height / 2;
      
      // Estilo WhatsApp
      canvasCtx.fillStyle = '#25D366';
      
      dataArrayRef.current!.forEach((val, i) => {
        // Solo mostrar un subconjunto de las barras para el efecto WhatsApp
        if (i % (dataArrayRef.current!.length / barCount) < 1) {
          const height = (val / 255) * (canvas.height * 0.8);
          const roundedHeight = Math.max(4, height * 0.7); // Mínimo 4px de altura
          
          // Dibujar barra redondeada
          const x = i * (canvas.width / dataArrayRef.current!.length);
          const y = centerY - roundedHeight/2;
          
          canvasCtx.beginPath();
          canvasCtx.roundRect(x, y, barWidth - 2, roundedHeight, 4);
          canvasCtx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const resetRecording = () => {
    setAudioUrl(null);
    setAudioBlob(null);
    setTime(0);
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    
    try {
      setIsUploading(true);
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'audio-recording.wav', {
        type: 'audio/wav'
      });
      formData.append('file', audioFile);
      formData.append('path', path);
      
      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (onRecordingComplete) onRecordingComplete(data.url);
      } else {
        throw new Error(data.error || 'Error al subir el audio');
      }
    } catch (error: unknown) {
      toast.error('Error al subir el audio: ' + (error as Error).message);
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Grabadora de Audio</h2>
        <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
          <FiMic className="text-blue-500" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
            {time}s
          </span>
        </div>
      </div>
      
      <div className="relative">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={80} 
          className="w-full h-20 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4"
        />
        
        {countdown !== null && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black bg-opacity-70 px-4 py-2 rounded-full">
              <span className="text-white text-2xl font-bold">
                {countdown > 0 ? `Comenzando en ${countdown}...` : '¡Grabando!'}
              </span>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-center gap-3">
        {/* Estado: Inactivo */}
        {!isRecording && !audioUrl && (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <FiMic />
            Comenzar Grabación
          </button>
        )}
        
        {/* Estado: Grabando */}
        {isRecording && (
          <div className="flex gap-3">
            <button
              onClick={isPaused ? resumeRecording : pauseRecording}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {isPaused ? <FiPlay /> : <FiPause />}
              {isPaused ? 'Continuar' : 'Pausar'}
            </button>
            
            <button
              onClick={stopRecording}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <FiSquare />
              Detener
            </button>
          </div>
        )}
        
        {/* Estado: Grabación completada */}
        {audioUrl && !isRecording && (
          <div className="w-full space-y-4">
            <audio controls src={audioUrl} className="w-full" />
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={startRecording}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiMic />
                Grabar Nuevo
              </button>
              
              <button
                onClick={sendAudio}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={!audioBlob || isUploading}
              >
                {isUploading ? (
                  <>
                    <FiRefreshCw className="animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <FiUpload />
                    Subir Audio
                  </>
                )}
              </button>
              
              <button
                onClick={resetRecording}
                className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiRefreshCw />
                Resetear
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
