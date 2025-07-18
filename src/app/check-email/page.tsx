"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ErrorMsj, FetchData, SuccessMsj } from "@/utils/Tools.tsx";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Badge } from "@/components/Badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FiMail, FiCheckCircle, FiAlertCircle, FiRefreshCw } from "react-icons/fi";

function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  const maskedUser = user[0] + "****";
  const [domName, domTld] = domain.split(".");
  const maskedDom = domName[0] + "***";
  return `${maskedUser}@${maskedDom}.${domTld}`;
}

export default function CheckEmailPage() {
  const params = useSearchParams();
  const email = params.get("email") || "";
  const [status, setStatus] = useState<"idle"|"sending"|"sent"|"error">("idle");
  const [cooldown, setCooldown] = useState(0);

  async function handleResend() {
    if (!email) return;
    setStatus("sending");
    const res = await FetchData<{ success: boolean, message: string }>("/api/auth/resend-verification", { email });
    if (res.success) {
      setStatus("sent");
      SuccessMsj(res.message);
      setCooldown(60); // 60s cooldown
      const interval = setInterval(() => {
        setCooldown(c => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    } else {
      setStatus("error");
      ErrorMsj(res.message);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card
        title="Revisa tu correo"
        icon={<FiMail className="text-blue-500 text-3xl" />}
        className="w-full max-w-md"
        variant="elevated"
      >
        <div className="flex flex-col items-center gap-2 mb-2">
          <Badge className="bg-yellow-100 text-yellow-800 mb-1 animate-pulse">
            <FiMail className="inline mr-1" /> Pendiente de verificación
          </Badge>
          <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-100">¡Gracias por registrarte en ClassNet!</h2>
        </div>
        <div className="mb-4">
          <p className="mb-2 text-gray-700 dark:text-gray-200">
            <span className="font-semibold text-blue-600">¡Ya casi terminas!</span> Hemos enviado un correo de verificación a <span className="font-semibold text-blue-600">{maskEmail(email)}</span>.
            <br />
            <span className="block mt-2">Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta y comenzar a disfrutar de todas las ventajas de <span className="font-bold text-purple-600">ClassNet</span>.</span>
          </p>
          <p className="text-xs text-gray-500 mb-4 italic">
            ¿No ves el correo? Revisa tu carpeta de <span className="font-semibold">spam</span> o <span className="font-semibold">promociones</span>.
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          {status === "sent" && (
            <Badge className="bg-green-100 text-green-700"><FiCheckCircle className="inline mr-1" /> ¡Correo reenviado!</Badge>
          )}
          {status === "error" && (
            <Badge className="bg-red-100 text-red-700"><FiAlertCircle className="inline mr-1" /> Error al reenviar. Intenta más tarde.</Badge>
          )}
        </div>
        <Button
          onClick={handleResend}
          disabled={cooldown > 0 || status === "sending"}
          isLoading={status === "sending"}
          icon={<FiRefreshCw />}
          fullWidth
          className="mt-6"
          variant="primary"
          size="md"
        >
          {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar correo de verificación"}
        </Button>
        <div className="mt-8 text-sm text-center text-gray-600 dark:text-gray-300">
          ¿Correo equivocado? <a href="/register" className="text-blue-600 underline">Volver al registro</a>
        </div>
        <div className="mt-4 text-xs text-gray-400 text-center">
          ¿Tienes problemas? <a href={"mailto:" + process.env.NEXT_PUBLIC_EMAIL_SUPPORT} className="text-blue-500 underline">Contáctanos</a> y te ayudaremos.
        </div>
      </Card>
    </div>
  );
}