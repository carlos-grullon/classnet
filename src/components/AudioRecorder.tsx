'use client';

import React, { useRef, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiMic, FiPlay, FiPause, FiSquare, FiUpload, FiRefreshCw } from 'react-icons/fi';
import { ErrorMsj } from '@/utils/Tools.tsx';

interface AudioRecorderProps {
  onRecordingComplete?: (audioUrl: string) => void;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({ 
  onRecordingComplete 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

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
      
      // Activar el audio context si está suspendido (requerido en algunos navegadores)
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      
      // Configurar ganancia ahora que el usuario ha interactuado
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = 2.0; // Aplicar ganancia
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const source = audioCtxRef.current.createMediaStreamSource(stream);
      const analyser = audioCtxRef.current.createAnalyser();
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
        const trimmedBlob = await trimAudio(blob, 1);
        setAudioBlob(trimmedBlob);
        setAudioUrl(URL.createObjectURL(trimmedBlob));
      };

      setIsRecording(true);
      setIsPaused(false);
      setTime(0);

      recorder.start();
      intervalRef.current = setInterval(() => setTime((prev) => prev + 1), 1000);
      drawWaves();
    } catch (error) {
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

  const trimAudio = async (blob: Blob, secondsToSkip: number): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const decoded = await audioCtx.decodeAudioData(arrayBuffer);
    const sampleRate = decoded.sampleRate;
    const newBuffer = audioCtx.createBuffer(
      decoded.numberOfChannels,
      decoded.length - secondsToSkip * sampleRate,
      sampleRate
    );

    for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
      const oldData = decoded.getChannelData(ch);
      const newData = newBuffer.getChannelData(ch);
      newData.set(oldData.subarray(secondsToSkip * sampleRate));
    }

    const offlineCtx = new OfflineAudioContext(
      newBuffer.numberOfChannels,
      newBuffer.length,
      newBuffer.sampleRate
    );
    const bufferSource = offlineCtx.createBufferSource();
    bufferSource.buffer = newBuffer;
    bufferSource.connect(offlineCtx.destination);
    bufferSource.start();

    const rendered = await offlineCtx.startRendering();
    const wavBlob = await bufferToBlob(rendered);

    return wavBlob;
  };

  const bufferToBlob = async (buffer: AudioBuffer): Promise<Blob> => {
    const numOfChan = buffer.numberOfChannels,
      length = buffer.length * numOfChan * 2 + 44,
      bufferArr = new ArrayBuffer(length),
      view = new DataView(bufferArr),
      sampleRate = buffer.sampleRate;

    let offset = 0;

    const writeString = (s: string) => {
      for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
      offset += s.length;
    };

    writeString('RIFF');
    view.setUint32(offset, 36 + buffer.length * numOfChan * 2, true);
    offset += 4;
    writeString('WAVE');
    writeString('fmt ');
    view.setUint32(offset, 16, true);
    offset += 4;
    view.setUint16(offset, 1, true);
    offset += 2;
    view.setUint16(offset, numOfChan, true);
    offset += 2;
    view.setUint32(offset, sampleRate, true);
    offset += 4;
    view.setUint32(offset, sampleRate * 2 * numOfChan, true);
    offset += 4;
    view.setUint16(offset, numOfChan * 2, true);
    offset += 2;
    view.setUint16(offset, 16, true);
    offset += 2;
    writeString('data');
    view.setUint32(offset, buffer.length * numOfChan * 2, true);
    offset += 4;

    for (let i = 0; i < buffer.length; i++) {
      for (let ch = 0; ch < numOfChan; ch++) {
        let sample = buffer.getChannelData(ch)[i];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(offset, sample * 0x7fff, true);
        offset += 2;
      }
    }

    return new Blob([view], { type: 'audio/wav' });
  };

  const drawWaves = () => {
    const canvas = canvasRef.current;
    const canvasCtx = canvas?.getContext('2d');
    if (!canvas || !canvasCtx || !analyserRef.current || !dataArrayRef.current) return;

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
      const formData = new FormData();
      const audioFile = new File([audioBlob], 'audio-recording.wav', {
        type: 'audio/wav'
      });
      formData.append('file', audioFile);
      
      const response = await fetch('/api/upload-files', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('Audio subido correctamente');
        console.log('Audio URL:', data.url);
        if (onRecordingComplete) onRecordingComplete(data.url);
      } else {
        throw new Error(data.error || 'Error al subir el audio');
      }
    } catch (error: unknown) {
      toast.error('Error al subir el audio: ' + (error as Error).message);
      console.error('Upload error:', error);
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
      
      <canvas 
        ref={canvasRef} 
        width={300} 
        height={80} 
        className="w-full h-20 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 mb-4" 
      />
      
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
                disabled={!audioBlob}
              >
                <FiUpload />
                Subir Audio
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
