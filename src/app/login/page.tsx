"use client";

import { FormEvent, useState } from "react";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormInput } from "@/components/forms/FormInput";
import { Modal } from "@/components/Modal";

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  const [successMessage, setSuccessMessage] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!formData.email) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }

    if (!formData.password) {
      newErrors.password = "La contraseña es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [tempLoginData, setTempLoginData] = useState<any>(null);

  const handleRoleSelection = async (role: 'P' | 'A') => {
    setShowRoleModal(false);
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...tempLoginData,
          user_type: role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      // Guardamos el ID de sesión
      if (data.idSession) {
        localStorage.setItem("sessionId", data.idSession);
      }

      setSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      setFormData({ email: "", password: "" });

      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setErrors({ general: error.message || "Error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrors({});
    setSuccessMessage(undefined);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al iniciar sesión");
      }

      if (data.TwoAccountsFound === true) {
        setTempLoginData({
          email: formData.email,
          password: formData.password
        });
        setShowRoleModal(true);
        return;
      }

      // Guardamos el ID de sesión
      if (data.idSession) {
        localStorage.setItem("sessionId", data.idSession);
      }

      setSuccessMessage("¡Inicio de sesión exitoso! Redirigiendo...");
      setFormData({ email: "", password: "" });

      // Redirigir después de un breve delay
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      console.error("Error al iniciar sesión:", error);
      setErrors({ general: error.message || "Error al iniciar sesión" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <AuthCard
      title="Iniciar Sesión"
      error={errors.general}
      success={successMessage}
    >
      <form onSubmit={handleSubmit}>
        <FormInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
          error={errors.email}
          required
        />

        <FormInput
          id="password"
          name="password"
          label="Contraseña"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          error={errors.password}
          required
        />

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className={`bg-blue-500 w-full hover:bg-blue-700 text-white 
              font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline 
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </div>
      </form>
    </AuthCard>
    <Modal
      isOpen={showRoleModal}
      onClose={() => setShowRoleModal(false)}
      onSelectRole={handleRoleSelection}
    />
    </>
      );
}
