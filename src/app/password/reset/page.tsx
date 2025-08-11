"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ErrorMsj, FetchData, SuccessMsj } from "@/utils/Tools.tsx";

function ResetPasswordContent() {
  const params = useSearchParams();
  const token = useMemo(() => params.get("token") || "", [params]);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return ErrorMsj("Token inválido o faltante.");
    if (!password || password.length < 6) return ErrorMsj("La contraseña debe tener al menos 6 caracteres.");
    if (password !== confirm) return ErrorMsj("Las contraseñas no coinciden.");

    try {
      setLoading(true);
      const res = await FetchData<{ success: boolean; message: string }>(
        "/api/auth/reset-password",
        { token, password }
      );
      if (res.success) {
        SuccessMsj(res.message || "Contraseña restablecida correctamente.");
      } else {
        ErrorMsj(res.message || "No se pudo restablecer la contraseña.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo restablecer la contraseña";
      ErrorMsj(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh] p-4">
      <ThemeToggle className="fixed top-4 right-4" />
      <Card title="Crear nueva contraseña" className="w-full max-w-md" variant="elevated">
        <form onSubmit={handleSubmit}>
          <Input
            label="Nueva contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          <Input
            label="Confirmar contraseña"
            name="confirm"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" fullWidth isLoading={loading} disabled={loading} variant="primary">
            Guardar nueva contraseña
          </Button>
        </form>
        <div className="mt-6 text-sm text-center text-gray-600 dark:text-gray-300">
          <a href="/login" className="text-blue-600 underline">Volver al inicio de sesión</a>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Cargando...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
