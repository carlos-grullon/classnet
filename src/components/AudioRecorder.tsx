'use client';

import React, { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiMic, FiPlay, FiPause, FiUpload, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { ErrorMsj } from '@/utils/Tools.tsx';
import * as lamejs from 'lamejs';

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
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  // Estados para manejo de permisos
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');

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
    // Usar webkitAudioContext explícitamente para Safari
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContextClass({ sampleRate: 44100 }); // Especificar sampleRate para mejor compatibilidad
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

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkMicrophonePermission();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // Para iOS, siempre establecer como 'prompt' inicialmente
      if (isIOS) {
        setPermissionStatus('prompt');
        return;
      }

      // Para otros navegadores
      if (navigator.permissions?.query) {
        try {
          const permissionResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(permissionResult.state as 'granted' | 'denied' | 'prompt');
        } catch {
          setPermissionStatus('prompt');
        }
      } else {
        setPermissionStatus('prompt');
      }
    } catch (error) {
      console.error('Error verificando permisos:', error);
      setPermissionStatus('prompt');
    }
  };

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const startRecording = async () => {
    try {
      if (!audioCtxRef.current) return;
      
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      // En iOS, mostrar el diálogo de permisos inmediatamente
      if (isIOS && permissionStatus !== 'granted') {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
          sessionStorage.setItem('microphonePermission', 'granted');
          setPermissionStatus('granted');
        } catch (error) {
          sessionStorage.setItem('microphonePermission', 'denied');
          setPermissionStatus('denied');
          throw error;
        }
      }

      // Resto de la lógica de grabación...
      setCountdown(3);
      
      const setupPromise = (async () => {
        if (audioCtxRef.current?.state === 'suspended') {
          await audioCtxRef.current.resume();
        }
        
        if (gainNodeRef.current) {
          gainNodeRef.current.gain.value = 2.0;
        }
        
        // Configuración específica para iOS
        const constraints = {
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // Solo guardar en sessionStorage
        sessionStorage.setItem('microphonePermission', 'granted');
        setPermissionStatus('granted');
        
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

        // Usar un único formato para todos los navegadores
        let options = {};
        
        // Intentar usar audio/wav para mayor compatibilidad
        if (MediaRecorder.isTypeSupported('audio/wav')) {
          options = { mimeType: 'audio/wav' };
        }
        
        const recorder = new MediaRecorder(stream, options);
        mediaRecorderRef.current = recorder;
        audioChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) audioChunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          try {
            const blob = new Blob(audioChunksRef.current, { type: 'audio/mp4' });
            setAudioBlob(blob);
            
            if (audioUrl) {
              URL.revokeObjectURL(audioUrl);
            }
            
            const url = URL.createObjectURL(blob);
            setAudioUrl(url);
            
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const testAudio = new Audio();
            testAudio.src = url;
            
            await new Promise((resolve, reject) => {
              testAudio.oncanplaythrough = resolve;
              testAudio.onerror = reject;
              setTimeout(resolve, 3000);
            });
          } catch (e) {
            console.warn('Error verificando audio:', e);
          } finally {
            setIsAudioLoading(false);
          }
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
      if (error instanceof DOMException && error.name === 'NotAllowedError') {
        sessionStorage.setItem('microphonePermission', 'denied');
        setPermissionStatus('denied');
        ErrorMsj('Por favor acepta los permisos del micrófono para grabar');
      } else {
        const message = error instanceof Error ? error.message : 'Error al acceder al micrófono';
        ErrorMsj(message);
      }
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
    setIsAudioLoading(true);
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
    // Limpiar URL del objeto antes de eliminar la referencia
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch (e) {
        console.warn('Error al revocar URL:', e);
      }
    }
    
    setAudioUrl(null);
    setAudioBlob(null);
    setTime(0);
  };

  const convertToMP3 = async (blob: Blob): Promise<Blob> => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      
      // Usar valores por defecto compatibles con voz
      const channels = 1; // Mono para optimizar tamaño
      const sampleRate = 44100; // Frecuencia estándar
      const bitrate = 64; // 64kbps
      
      const mp3encoder = new lamejs.Mp3Encoder(channels, sampleRate, bitrate);
      
      const samples = new Int16Array(audioBuffer.length * channels);
      for (let i = 0; i < audioBuffer.length; i++) {
        samples[i] = audioBuffer.getChannelData(0)[i] * 32767; // Canal 0 (mono)
      }
      
      const mp3Data = mp3encoder.encodeBuffer(samples);
      mp3encoder.flush();
      
      return new Blob([mp3Data], { type: 'audio/mpeg' });
    } catch (error) {
      console.error('Error converting to MP3:', error);
      throw error;
    }
  };

  const sendAudio = async () => {
    if (!audioBlob) return;
    
    try {
      setIsUploading(true);
      const mp3Blob = await convertToMP3(audioBlob);
      const formData = new FormData();
      // Asegurarse de que el tipo de archivo sea compatible con iOS
      const audioFile = new File([mp3Blob], 'audio-recording.mp3', {
        type: 'audio/mpeg'
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
    <div className="relative">
      {/iPad|iPhone|iPod/.test(navigator.userAgent) && permissionStatus === 'denied' && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <p className="text-yellow-700 text-sm">
            <strong>Aviso para iOS:</strong> Safari requiere aceptar los permisos del micrófono cada vez que se recarga la página.
          </p>
        </div>
      )}
      
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
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiCheck />
                Listo
              </button>
            </div>
          )}
          
          {/* Estado: Grabación completada */}
          {audioUrl && !isRecording && (
            <div className="w-full space-y-4">
              {/* Reproductor de audio nativo optimizado para iOS */}
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                {isAudioLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-300">Preparando audio...</span>
                  </div>
                ) : (
                  <audio 
                    id="ios-audio-player"
                    src={audioUrl}
                    onLoadedData={() => {
                      console.log('Datos de audio cargados');
                      setIsAudioLoading(false);
                    }}
                    onError={(e) => {
                      console.error('Error en reproducción de audio:', e);
                      // Solo mostrar error si no estamos en el proceso de carga inicial
                      if (!isAudioLoading) {
                        ErrorMsj('Error al reproducir el audio');
                      }
                    }}
                    // Atributos específicos para iOS
                    playsInline
                    preload="auto"
                    controls
                    className="w-full"
                  />
                )}
              </div>
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
    </div>
  );
};
