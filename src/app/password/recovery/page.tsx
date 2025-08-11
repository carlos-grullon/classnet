"use client";

import { Suspense, useState } from "react";
import { ErrorMsj, FetchData, SuccessMsj } from "@/utils/Tools.tsx";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Input } from "@/components/Input";
import { FiMail } from "react-icons/fi";

function PasswordRecoveryContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return ErrorMsj("Ingresa tu correo electrónico");
    if (cooldown > 0) return;

    try {
      setLoading(true);
      const res = await FetchData<{ success: boolean; message: string }>(
        "/api/auth/request-password-reset",
        { email }
      );
      SuccessMsj(res.message || "Si el correo existe, enviaremos un enlace para restablecer la contraseña.");
      setCooldown(60);
      const interval = setInterval(() => {
        setCooldown((c) => {
          if (c <= 1) {
            clearInterval(interval);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo enviar el correo";
      ErrorMsj(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card
        title="Restablecer contraseña"
        icon={<FiMail className="text-blue-500 text-3xl" />}
        className="w-full max-w-md"
        variant="elevated"
      >
        <p className="text-gray-700 dark:text-gray-200 mb-4">
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
        </p>
        <form onSubmit={handleSubmit}>
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="tu@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            isLoading={loading}
            disabled={loading || cooldown > 0}
            variant="primary"
          >
            {cooldown > 0 ? `Reintentar en ${cooldown}s` : "Enviar enlace de restablecimiento"}
          </Button>
        </form>
        <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-300">
          ¿Recordaste tu contraseña? <a href="/login" className="text-blue-600 underline">Inicia sesión</a>
        </div>
      </Card>
    </div>
  );
}

export default function PasswordRecoveryPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
      <PasswordRecoveryContent />
    </Suspense>
  );
}