"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: 'P' | 'A') => void;
}

export function Modal({ isOpen, onClose, onSelectRole }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4"
        style={{ background: 'var(--background-soft)' }}
      >
        <h3 
          className="text-xl font-semibold mb-4 text-center"
          style={{ color: 'var(--foreground)' }}
        >
          Se encontraron dos cuentas
        </h3>
        <p 
          className="mb-6 text-center"
          style={{ color: 'var(--foreground-muted)' }}
        >
          ¿Con qué tipo de cuenta deseas ingresar?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSelectRole('P')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Ingresar como Profesor
          </button>
          <button
            onClick={() => onSelectRole('A')}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Ingresar como Estudiante
          </button>
        </div>
      </div>
    </div>
  );
}
