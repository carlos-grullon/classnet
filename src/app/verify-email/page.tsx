"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { FetchData, ErrorMsj, SuccessMsj } from "@/utils/Tools.tsx";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FiCheckCircle, FiAlertCircle, FiMail } from "react-icons/fi";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Token no proporcionado.');
      return;
    }
    async function verifyEmail() {
      const data = await FetchData<{ success: boolean, message: string }>("/api/auth/verify-email", { token });
      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        SuccessMsj(data.message);
      } else {
        setStatus('error');
        setMessage(data.message);
        ErrorMsj(data.message);
      }
    }
    verifyEmail();
  }, [searchParams]);

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card
        title="Verificación de correo"
        icon={<FiMail className="text-blue-500 text-3xl" />}
        className="w-full max-w-md"
        variant="elevated"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          {status === 'success' && (
            <Badge className="bg-green-100 text-green-700 mb-1"><FiCheckCircle className="inline mr-1" /> ¡Correo verificado!</Badge>
          )}
          {status === 'error' && (
            <Badge className="bg-red-100 text-red-700 mb-1"><FiAlertCircle className="inline mr-1" /> Error</Badge>
          )}
          {status === 'loading' && (
            <Badge className="bg-yellow-100 text-yellow-800 mb-1 animate-pulse"><FiMail className="inline mr-1" /> Verificando...</Badge>
          )}
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">
            {status === 'success' ? '¡Tu correo ha sido verificado exitosamente!' : status === 'error' ? 'No se pudo verificar el correo' : 'Verificando tu correo...'}
          </h2>
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            {status === 'loading'
              ? 'Estamos verificando tu correo electrónico, por favor espera unos segundos...'
              : message}
          </p>
        </div>
        {status !== 'loading' && (
          <Button
            onClick={() => router.push('/login')}
            fullWidth
            variant="primary"
            size="md"
            icon={<FiCheckCircle />}
            className="mt-2"
          >
            Ir a iniciar sesión
          </Button>
        )}
        <div className="mt-8 text-sm text-center text-gray-600 dark:text-gray-300">
          ¿No era tu correo? <a href="/register" className="text-blue-600 underline">Volver al registro</a>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">
          ¿Tienes problemas? <a href="mailto:classnet.info@gmail.com" className="text-blue-500 underline">Contáctanos</a> y te ayudaremos.
        </div>
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
} 